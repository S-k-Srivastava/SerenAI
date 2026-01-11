import { ILLMConfig } from "../../models/LLMConfig.js";
import { IBaseRepository } from "./IBaseRepository.js";
import { QueryOptions, ClientSession } from "mongoose";

export interface ILLMConfigsRepository extends IBaseRepository<ILLMConfig> {
    findByUserId(userId: string, page: number, limit: number, options?: QueryOptions & { session?: ClientSession }): Promise<{ llmConfigs: ILLMConfig[]; total: number }>;
}
