import LLMConfigModel, { ILLMConfig } from "../models/LLMConfig.js";
import { BaseRepository } from "./BaseRepository.js";
import { ILLMConfigsRepository } from "./interfaces/ILLMConfigsRepository.js";
import { QueryOptions, ClientSession } from "mongoose";

class LLMConfigsRepository extends BaseRepository<ILLMConfig> implements ILLMConfigsRepository {
    constructor() {
        super(LLMConfigModel);
    }

    async findByUserId(userId: string, page: number = 1, limit: number = 10, options?: QueryOptions & { session?: ClientSession }): Promise<{ llmConfigs: ILLMConfig[]; total: number }> {
        const skip = (page - 1) * limit;
        // Sequential queries to avoid transaction number conflicts when using session
        const llmConfigs = await this.model.find({ user_id: userId }, null, options)
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit);
        const total = await this.model.countDocuments({ user_id: userId }).session(options?.session || null);
        return { llmConfigs, total };
    }
}

export const llmConfigsRepository = new LLMConfigsRepository();
