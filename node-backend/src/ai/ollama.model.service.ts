import { ChatOpenAI } from "@langchain/openai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { IModelService, ModelConfig } from "./interfaces/IModelService.js";
import { tokenService } from "./token.service.js";
import { AppError } from "../errors/AppError.js";
import logger from "../utils/logger/index.js";

export class OllamaModelService implements IModelService {
    countTokens(text: string): number {
        // Use approximate token counting for Ollama
        return tokenService.countTokens(text, "gpt-4");
    }

    getModel(config: ModelConfig): BaseChatModel {
        let baseUrl = config.llmConfig.base_url;

        if (!baseUrl) {
            throw new AppError("Ollama base URL is required (e.g., http://localhost:11434)", 400);
        }

        // SMART SWAP: Docker containers cannot reach 'localhost' of the host directly.
        // If we are in PRODUCTION (Docker) and the user put 'localhost' or '127.0.0.1',
        // transparently swap it to 'host.docker.internal' which we mapped in docker-compose.
        if ((baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1"))) {
             baseUrl = baseUrl.replace("localhost", "host.docker.internal").replace("127.0.0.1", "host.docker.internal");
        }

        try {
            // Try creating model with temperature
            return new ChatOpenAI({
                configuration: {
                    baseURL: `${baseUrl}/v1`,
                },
                apiKey: "ollama", // Ollama doesn't need real API key but field is required
                model: config.llmConfig.model_name,
                temperature: config.temperature,
                maxTokens: config.maxTokens,
            });
        } catch (error: unknown) {
            // If temperature is not supported, retry without it
            logger.warn(`Ollama model ${config.llmConfig.model_name} does not support temperature parameter, retrying without it. Error: ${error instanceof Error ? error.message : String(error)}`);

            try {
                return new ChatOpenAI({
                    configuration: {
                        baseURL: `${baseUrl}/v1`,
                    },
                    apiKey: "ollama",
                    model: config.llmConfig.model_name,
                    maxTokens: config.maxTokens,
                });
            } catch (retryError: unknown) {
                logger.error(`Failed to initialize Ollama model ${config.llmConfig.model_name} even without temperature. Error: ${retryError instanceof Error ? retryError.message : String(retryError)}`);
                throw retryError;
            }
        }
    }
}

export const ollamaModelService = new OllamaModelService();
