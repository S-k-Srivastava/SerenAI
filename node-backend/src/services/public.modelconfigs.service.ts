import { IPublicModelConfigsResponse } from "../types/index.js";
import {
    LLMProviderEnum,
    EmbeddingProviderEnum,
    LLMProviderDescriptions,
    EmbeddingProviderDescriptions,
    LLMProviderFieldRequirements,
    EmbeddingProviderFieldRequirements
} from "../types/enums.js";
import { IPublicModelConfigsService } from "./interfaces/IPublicModelConfigsService.js";

export class PublicModelConfigsService implements IPublicModelConfigsService {
    getPublicModelConfigs(): IPublicModelConfigsResponse {
        const llmProviders = Object.values(LLMProviderEnum).map(provider => ({
            value: provider,
            label: provider,
            description: LLMProviderDescriptions[provider],
            fields: LLMProviderFieldRequirements[provider]
        }));

        const embeddingProviders = Object.values(EmbeddingProviderEnum).map(provider => ({
            value: provider,
            label: provider,
            description: EmbeddingProviderDescriptions[provider],
            fields: EmbeddingProviderFieldRequirements[provider]
        }));

        return {
            llmProviders,
            embeddingProviders
        };
    }
}

export const publicModelConfigsService = new PublicModelConfigsService();
