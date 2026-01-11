import { IModelService } from "./interfaces/IModelService.js";
import { LLMProviderEnum } from "../types/enums.js";
import { openaiModelService } from "./openai.model.service.js";
import { ollamaModelService } from "./ollama.model.service.js";
import { AppError } from "../errors/AppError.js";

const services: Map<LLMProviderEnum, IModelService> = new Map([
    [LLMProviderEnum.OPENAI, openaiModelService],
    [LLMProviderEnum.OLLAMA, ollamaModelService],
]);

export const ModelFactory = {
    getModelService(provider: LLMProviderEnum): IModelService {
        const service = services.get(provider);

        if (!service) {
            throw new AppError(`Unsupported LLM provider: ${provider}`, 400);
        }

        return service;
    }
};
