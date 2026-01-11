import { Document } from "@langchain/core/documents";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { vectorService } from "./vector.service.js";
import logger from "../utils/logger/index.js";
import {
    IRAGService,
    IChatRequest,
    IChatResponse
} from "./interfaces/IRAGService.js";
import { ModelFactory } from "./model.factory.js";
import { EmbeddingFactory } from "./embedding.factory.js";

const formatDocumentsAsString = (documents: Document[]) => {
    return documents.map((doc) => doc.pageContent).join("\n\n");
};

import { usageEventsService } from "../services/usageEvents.service.js";
import { UsageEventType } from "../models/UsageEvent.js";
import { IMessage } from "../models/Conversation.js";

import { IChunkResponse } from "./interfaces/IRAGService.js";

export interface IMessageWithSources extends IMessage {
    sources?: IChunkResponse[];
}

export class RAGService implements IRAGService {
    private retrievedDocsCount = 4;

    async chat(params: IChatRequest): Promise<IChatResponse> {
        const { question, history = [], documentFilter, systemPrompt, userId, session, llmConfig, temperature, maxTokens } = params;

        const client = vectorService.getClient();
        const qdrantFilter: Record<string, unknown> = {};

        if (documentFilter.document_id) {
            if (typeof documentFilter.document_id === 'string') {
                qdrantFilter.must = [
                    {
                        key: "document_id",
                        match: { value: documentFilter.document_id }
                    }
                ];
            } else if (documentFilter.document_id.$in) {
                qdrantFilter.must = [
                    {
                        key: "document_id",
                        match: { any: documentFilter.document_id.$in }
                    }
                ];
            }
        }

        logger.info(`[RAGService] Question: "${question}"`);
        logger.info(`[RAGService] Applied Filter: ${JSON.stringify(qdrantFilter)}`);

        // Get embedding service based on environment configuration
        const embeddingService = EmbeddingFactory.getEmbeddingService();
        const embeddings = await Promise.resolve(embeddingService.getModel());
        const questionVector = await embeddings.embedQuery(question);

        // Search using Qdrant
        const searchParams: {
            vector: number[];
            limit: number;
            filter?: Record<string, unknown>;
            with_payload: true;
        } = {
            vector: questionVector,
            limit: this.retrievedDocsCount,
            with_payload: true,
        };

        if (Object.keys(qdrantFilter).length > 0) {
            searchParams.filter = qdrantFilter;
        }

        const searchResult = await client.search("documents", searchParams);

        logger.info(`[RAGService] Retrieved ${searchResult.length} documents.`);

        if (searchResult.length > 0) {
            searchResult.forEach((result, i) => {
                const content = result.payload?.text as string || "";
                logger.info(`  Source #${i + 1}: ${content.substring(0, 100)}... (ID: ${result.payload?.document_id})`);
            });
        }

        // Convert Qdrant results to LangChain Document format
        const retrievedDocs = searchResult.map(result => new Document({
            pageContent: result.payload?.text as string || "",
            metadata: result.payload || {}
        }));

        const sources = searchResult.map(result => ({
            chunk_id: result.payload?.chunk_id as string,
            content: result.payload?.text as string || "",
            chunk_index: (result.payload?.chunk_index as number) || 0,
            metadata: result.payload || {}
        }));

        // Get model service based on provider
        const modelService = ModelFactory.getModelService(llmConfig.provider);
        const model = await Promise.resolve(modelService.getModel({ llmConfig, temperature, maxTokens }));

        const template = `
        ${systemPrompt || "You are a helpful assistant. Use the following pieces of context to answer the question at the end."}
        
        If you don't know the answer, just say that you don't know, don't try to make up an answer.
        
        Context:
        {context}
        
        Chat History:
        {history}
        
        Question: {question}
        Helpful Answer:`;

        const prompt = PromptTemplate.fromTemplate(template);

        const chain = RunnableSequence.from([
            {
                context: () => formatDocumentsAsString(retrievedDocs),
                question: (input: { question: string; history: string }) => input.question,
                history: (input: { question: string; history: string }) => input.history,
            },
            prompt,
            model,
            new StringOutputParser(),
        ]);

        const formattedHistory = history.map(h => `${h.role}: ${h.content}`).join("\n");

        const response = await chain.invoke({
            question,
            history: formattedHistory,
        });

        // Track usage
        try {
            // Rough estimation of full prompt
            // Note: Exact prompt reconstruction is complex due to LC internals, but we can approximate:
            const contextStr = formatDocumentsAsString(retrievedDocs);
            // Reconstruct template filling
            const fullInput = template
                .replace("{context}", contextStr)
                .replace("{history}", formattedHistory)
                .replace("{question}", question);

            const inputTokens = modelService.countTokens(fullInput);
            const outputTokens = modelService.countTokens(response);
            const embeddingOutputTokens = embeddingService.countTokens(contextStr);

            // Sequential calls to avoid transaction number conflicts when using session
            await usageEventsService.createEvent(
                userId,
                llmConfig.model_name,
                llmConfig.provider,
                inputTokens,
                UsageEventType.LLM_INPUT,
                session
            );
            await usageEventsService.createEvent(
                userId,
                llmConfig.model_name,
                llmConfig.provider,
                outputTokens,
                UsageEventType.LLM_OUTPUT,
                session
            );
            await usageEventsService.createEvent(
                userId,
                embeddingService.getModelName(),
                embeddingService.getProviderName(),
                embeddingOutputTokens,
                UsageEventType.QUERY_DOCUMENT,
                session
            );
        } catch (error) {
            logger.error(`[RAGService] Error tracking usage: ${error}`);
        }

        return {
            response,
            sources
        };
    }

    async getChunks(chunkIds: string[]) {
        return await vectorService.getChunksByIds(chunkIds);
    }

    async hydrateMessages(messages: IMessage[]): Promise<IMessageWithSources[]> {
        // Collect all chunk IDs
        const allChunkIds = new Set<string>();
        messages.forEach((msg) => {
            if (msg.chunk_ids && msg.chunk_ids.length > 0) {
                msg.chunk_ids.forEach((id: string) => allChunkIds.add(id));
            }
        });

        if (allChunkIds.size === 0) return messages;

        // Fetch chunk details
        const chunks = await this.getChunks(Array.from(allChunkIds));
        const chunkMap = new Map(chunks.map((c) => [c.chunk_id, c]));

        // Hydrate sources
        return messages.map((msg) => {
            if (msg.chunk_ids && msg.chunk_ids.length > 0) {
                return {
                    ...msg,
                    sources: msg.chunk_ids
                        .map((id: string) => chunkMap.get(id))
                        .filter((c): c is IChunkResponse => c !== undefined)
                };
            }
            return msg;
        });
    }
}

export const ragService = new RAGService();
