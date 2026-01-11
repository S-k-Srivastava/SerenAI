import { Embeddings } from "@langchain/core/embeddings";

export interface IEmbeddingService {
    getModel(): Promise<Embeddings> | Embeddings;
    countTokens(text: string): number;
    getModelName(): string;
    getProviderName(): string;
    getDimensions(): number;
}
