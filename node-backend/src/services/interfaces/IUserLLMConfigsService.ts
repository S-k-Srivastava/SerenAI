import { CreateLLMConfigRequest, UpdateLLMConfigRequest } from "../../schemas/llmconfig.js";
import { ILLMConfigResponse, IUserLLMConfigsResponse } from "../../types/index.js";

export interface IUserLLMConfigsService {
    createLLMConfig(userId: string, data: CreateLLMConfigRequest): Promise<ILLMConfigResponse>;
    getLLMConfigs(userId: string, page: number, limit: number): Promise<IUserLLMConfigsResponse>;
    getLLMConfigById(userId: string, llmConfigId: string): Promise<ILLMConfigResponse>;
    updateLLMConfig(userId: string, llmConfigId: string, data: UpdateLLMConfigRequest): Promise<ILLMConfigResponse>;
    deleteLLMConfig(userId: string, llmConfigId: string): Promise<void>;
}
