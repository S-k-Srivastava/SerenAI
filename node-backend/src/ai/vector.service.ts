import { QdrantClient } from "@qdrant/js-client-rest";
import { EmbeddingFactory } from "./embedding.factory.js";
import { env } from "../config/env/index.js";
import logger from "../utils/logger/index.js";
import {
    IVectorService,
    IIndexDocumentsResponse,
    IDocumentFilterRequest,
    IChunkResponse
} from "./interfaces/IVectorService.js";

import { usageEventsService } from "../services/usageEvents.service.js";
import { UsageEventType } from "../models/UsageEvent.js";
import { v4 as uuidv4 } from "uuid";

export class VectorService implements IVectorService {
    private client: QdrantClient;
    private collectionName: string;
    private initPromise: Promise<void>;

    constructor() {
        const config: { url: string; apiKey?: string } = {
            url: env.QDRANT_URL
        };

        if (env.QDRANT_API_KEY) {
            config.apiKey = env.QDRANT_API_KEY;
        }

        this.client = new QdrantClient(config);
        this.collectionName = env.QDRANT_COLLECTION_NAME;
        this.initPromise = this.initializeCollection();
    }

    private async initializeCollection(): Promise<void> {
        try {
            // Check if collection exists
            const collections = await this.client.getCollections();
            const collectionExists = collections.collections.some(
                (col) => col.name === this.collectionName
            );

            if (!collectionExists) {
                const embeddingService = EmbeddingFactory.getEmbeddingService();
                const vectorSize = embeddingService.getDimensions();
                logger.info(`[VectorService] Creating collection: ${this.collectionName} with vector size: ${vectorSize}`);

                // Create collection with dynamic embedding dimensions
                await this.client.createCollection(this.collectionName, {
                    vectors: {
                        size: vectorSize,
                        distance: "Cosine",
                    },
                });

                // Create payload indexes for efficient filtering
                await this.client.createPayloadIndex(this.collectionName, {
                    field_name: "document_id",
                    field_schema: "keyword",
                });

                await this.client.createPayloadIndex(this.collectionName, {
                    field_name: "chunk_id",
                    field_schema: "keyword",
                });

                await this.client.createPayloadIndex(this.collectionName, {
                    field_name: "user_id",
                    field_schema: "keyword",
                });

                logger.info(`[VectorService] Collection created successfully: ${this.collectionName}`);
            } else {
                logger.info(`[VectorService] Collection already exists: ${this.collectionName}`);
            }
        } catch (error) {
            logger.error(`[VectorService] Error initializing collection: ${error}`);
            throw error;
        }
    }
    getClient(): QdrantClient {
        return this.client;
    }

    async indexDocuments(texts: string[], metadata: Record<string, unknown>[]): Promise<IIndexDocumentsResponse> {
        await this.initPromise;

        logger.info(`[VectorService] Indexing ${texts.length} texts with metadata: ${JSON.stringify(metadata.map(m => m.document_id))}`);

        const embeddingService = EmbeddingFactory.getEmbeddingService();
        const embeddings = await embeddingService.getModel();
        const vectors = await embeddings.embedDocuments(texts);

        const points = texts.map((text, i) => ({
            id: uuidv4(),
            vector: vectors[i] || [],
            payload: {
                text: text,
                ...metadata[i],
                created_at: new Date().toISOString(),
            },
        }));

        await this.client.upsert(this.collectionName, {
            wait: true,
            points: points,
        });

        const ids = points.map(p => p.id);
        logger.info(`[VectorService] Indexing complete. ${ids.length} docs inserted.`);

        // Track usage
        try {
            if (metadata && metadata.length > 0 && metadata[0]?.user_id) {
                const userId = metadata[0].user_id as string;
                let totalTokens = 0;
                for (const text of texts) {
                    totalTokens += embeddingService.countTokens(text);
                }

                await usageEventsService.createEvent(
                    userId,
                    embeddingService.getModelName(),
                    embeddingService.getProviderName(),
                    totalTokens,
                    UsageEventType.CREATE_DOCUMENT_INDEX
                );
            } else {
                logger.warn("[VectorService] Skipping usage tracking: user_id not found in metadata");
            }
        } catch (error) {
            logger.error(`[VectorService] Error tracking usage: ${error}`);
        }

        return {
            indexed_count: ids.length,
            ids: ids,
        };
    }

    async deleteDocuments(filter: IDocumentFilterRequest): Promise<void> {
        await this.initPromise;

        logger.info(`[VectorService] Deleting documents with filter: ${JSON.stringify(filter)}`);

        const qdrantFilter: Record<string, unknown> = {};

        if (typeof filter.document_id === 'string') {
            qdrantFilter.must = [
                {
                    key: "document_id",
                    match: { value: filter.document_id }
                }
            ];
        } else if (filter.document_id && filter.document_id.$in) {
            qdrantFilter.must = [
                {
                    key: "document_id",
                    match: { any: filter.document_id.$in }
                }
            ];
        }

        await this.client.delete(this.collectionName, {
            wait: true,
            filter: qdrantFilter,
        });

        logger.info(`[VectorService] Document deletion complete.`);
    }

    async getChunksByDocumentId(documentId: string): Promise<IChunkResponse[]> {
        await this.initPromise;

        logger.info(`[VectorService] Retrieving chunks for document_id: ${documentId}`);

        const result = await this.client.scroll(this.collectionName, {
            filter: {
                must: [
                    {
                        key: "document_id",
                        match: { value: documentId }
                    }
                ]
            },
            limit: 1000,
            with_payload: true,
            with_vector: false,
        });

        const chunks = result.points;
        logger.info(`[VectorService] Retrieved ${chunks.length} chunks for document ${documentId}`);

        // Sort by chunk_index
        const sortedChunks = chunks.sort((a, b) => {
            const indexA = (a.payload?.chunk_index as number) || 0;
            const indexB = (b.payload?.chunk_index as number) || 0;
            return indexA - indexB;
        });

        return sortedChunks.map(chunk => ({
            chunk_id: chunk.payload?.chunk_id as string,
            content: chunk.payload?.text as string,
            chunk_index: chunk.payload?.chunk_index as number,
            metadata: {
                document_id: chunk.payload?.document_id,
                user_id: chunk.payload?.user_id,
                created_at: chunk.payload?.created_at,
                characterCount: (chunk.payload?.text as string)?.length || 0,
                wordCount: (chunk.payload?.text as string)?.split(/\s+/).filter(word => word.length > 0).length || 0,
            }
        }));
    }

    async getChunksByIds(chunkIds: string[]): Promise<IChunkResponse[]> {
        if (chunkIds.length === 0) return [];

        await this.initPromise;

        logger.info(`[VectorService] Retrieving ${chunkIds.length} chunks by IDs`);

        const result = await this.client.scroll(this.collectionName, {
            filter: {
                must: [
                    {
                        key: "chunk_id",
                        match: { any: chunkIds }
                    }
                ]
            },
            limit: chunkIds.length,
            with_payload: true,
            with_vector: false,
        });

        const chunks = result.points;

        return chunks.map(chunk => ({
            chunk_id: chunk.payload?.chunk_id as string,
            content: chunk.payload?.text as string,
            chunk_index: chunk.payload?.chunk_index as number,
            metadata: {
                document_id: chunk.payload?.document_id,
                user_id: chunk.payload?.user_id,
                created_at: chunk.payload?.created_at,
                characterCount: (chunk.payload?.text as string)?.length || 0,
                wordCount: (chunk.payload?.text as string)?.split(/\s+/).filter(word => word.length > 0).length || 0,
            }
        }));
    }
}

export const vectorService = new VectorService();
