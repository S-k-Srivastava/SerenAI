import { ChatOpenAI } from "@langchain/openai";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { IModelService, ModelConfig } from "./interfaces/IModelService.js";
import { tokenService } from "./token.service.js";
import { AppError } from "../errors/AppError.js";
import logger from "../utils/logger/index.js";

export class OpenAIModelService implements IModelService {
    countTokens(text: string): number {
        return tokenService.countTokens(text, "gpt-4");
    }

    getModel(config: ModelConfig): BaseChatModel {
        const apiKey = config.llmConfig.api_key;

        if (!apiKey) {
            throw new AppError("OpenAI API key is required", 400);
        }

        try {
            // Try creating model with temperature
            return new ChatOpenAI({
                configuration: {
                    apiKey: apiKey,
                },
                model: config.llmConfig.model_name,
                temperature: config.temperature,
                maxTokens: config.maxTokens,
            });
        } catch (error: unknown) {
            // If temperature is not supported, retry without it
            logger.warn(`Model ${config.llmConfig.model_name} does not support temperature parameter, retrying without it. Error: ${error instanceof Error ? error.message : String(error)}`);

            try {
                return new ChatOpenAI({
                    configuration: {
                        apiKey: apiKey,
                    },
                    model: config.llmConfig.model_name,
                    maxTokens: config.maxTokens,
                });
            } catch (retryError: unknown) {
                logger.error(`Failed to initialize model ${config.llmConfig.model_name} even without temperature. Error: ${retryError instanceof Error ? retryError.message : String(retryError)}`);
                throw retryError;
            }
        }
    }
}

export const openaiModelService = new OpenAIModelService();
