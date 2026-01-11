import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ILLMConfig } from "../../models/LLMConfig.js";

export interface ModelConfig {
    llmConfig: ILLMConfig;
    temperature: number;
    maxTokens: number;
}

export interface IModelService {
    getModel(config: ModelConfig): Promise<BaseChatModel> | BaseChatModel;
    countTokens(text: string): number;
}
