import { IEmbeddingService } from "./interfaces/IEmbeddingService.js";
import { openaiEmbeddingService } from "./openai.embedding.service.js";
import { localEmbeddingService } from "./local.embedding.service.js";
import { env } from "../config/env/index.js";

export const EmbeddingFactory = {
    getEmbeddingService(): IEmbeddingService {
        // Use environment variable to determine which embedding service to use
        if (env.USE_LOCAL_EMBEDDING) {
            return localEmbeddingService as IEmbeddingService;
        } else {
            return openaiEmbeddingService as IEmbeddingService;
        }
    }
};
