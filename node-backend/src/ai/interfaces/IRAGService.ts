import { IDocumentFilterRequest } from "./IVectorService.js";
import { ClientSession } from "mongoose";
import { ILLMConfig } from "../../models/LLMConfig.js";

export interface IChatRequest {
    question: string;
    history?: { role: string; content: string }[];
    documentFilter: IDocumentFilterRequest;
    systemPrompt: string;
    userId: string;
    session?: ClientSession;
    llmConfig: ILLMConfig;
    temperature: number;
    maxTokens: number;
}

export interface IChunkResponse {
    chunk_id: string;
    content: string;
    chunk_index: number;
    metadata: Record<string, unknown>;
}

export interface IChatResponse {
    response: string;
    sources: IChunkResponse[];
}

export interface IRAGService {
    chat(params: IChatRequest): Promise<IChatResponse>;
}
