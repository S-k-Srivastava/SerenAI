import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { Embeddings } from "@langchain/core/embeddings";
import { env } from "../config/env/index.js";
import { IEmbeddingService } from "./interfaces/IEmbeddingService.js";
import { tokenService } from "./token.service.js";
import logger from "../utils/logger/index.js";

export class LocalEmbeddingService implements IEmbeddingService {
    private modelName: string;
    private provider = "docker-tei";
    private serviceUrl: string;
    private model: HuggingFaceInferenceEmbeddings | null = null;

    constructor() {
        this.modelName = env.EMBEDDING_LOCAL_MODEL;
        // Default to http://embeddings:80 if not specified (docker dns)
        // locally one might use http://localhost:8080 or leave it empty if env is set
        // But for Docker setup we rely on env usually.
        this.serviceUrl = process.env.EMBEDDING_SERVICE_URL || "http://embeddings:80";
        logger.info(`Initialized Docker TEI Embedding Service at: ${this.serviceUrl} for model: ${this.modelName}`);
    }

    countTokens(text: string): number {
        // Approximate
        return tokenService.countTokens(text, "gpt-3.5-turbo"); 
    }

    getModelName(): string {
        return this.modelName;
    }

    getProviderName(): string {
        return this.provider;
    }

    getModel(): Embeddings {
        if (!this.model) {
            this.model = new HuggingFaceInferenceEmbeddings({
                endpointUrl: this.serviceUrl,
                model: this.modelName,
                // We don't need an API key for local TEI usually, unless configured.
            });
        }
        return this.model;
    }

    getDimensions(): number {
        return 768; // BAAI/bge-base-en has 768 dimensions
    }
}

export const localEmbeddingService = new LocalEmbeddingService();
