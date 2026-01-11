import { OpenAIEmbeddings } from "@langchain/openai";
import { Embeddings } from "@langchain/core/embeddings";
import { env } from "../config/env/index.js";
import { IEmbeddingService } from "./interfaces/IEmbeddingService.js";
import { tokenService } from "./token.service.js";
import { AppError } from "../errors/AppError.js";

export class OpenAIEmbeddingService implements IEmbeddingService {
    private modelName = "text-embedding-3-small";
    private provider = "openai";

    countTokens(text: string): number {
        return tokenService.countTokens(text, "gpt-3.5-turbo");
    }

    getModelName(): string {
        return this.modelName;
    }

    getProviderName(): string {
        return this.provider;
    }

    getModel(): Embeddings {
        if (!env.OPENAI_API_KEY || env.OPENAI_API_KEY.trim() === "") {
            throw new AppError(
                "OPENAI_API_KEY is not configured in environment variables. Please set it to use OpenAI embeddings.",
                500
            );
        }

        return new OpenAIEmbeddings({
            openAIApiKey: env.OPENAI_API_KEY,
            modelName: this.modelName,
        });
    }

    getDimensions(): number {
        return 1536; // text-embedding-3-small has 1536 dimensions
    }
}

export const openaiEmbeddingService = new OpenAIEmbeddingService();
