import { NotFoundError } from "../errors/index.js";
import mongoose from "mongoose";
import { llmConfigsRepository } from "../repositories/llmconfigs.repository.js";
import { ILLMConfigResponse, IUserLLMConfigsResponse } from "../types/index.js";
import { CreateLLMConfigRequest, UpdateLLMConfigRequest } from "../schemas/llmconfig.js";
import { ILLMConfig } from "../models/LLMConfig.js";

import { IUserLLMConfigsService } from "./interfaces/IUserLLMConfigsService.js";

export class UserLLMConfigsService implements IUserLLMConfigsService {
    async createLLMConfig(
        userId: string,
        data: CreateLLMConfigRequest
    ): Promise<ILLMConfigResponse> {
        const createData: Partial<ILLMConfig> = {
            user_id: new mongoose.Types.ObjectId(userId),
            model_name: data.model_name,
            provider: data.provider,
        };

        if (data.api_key) createData.api_key = data.api_key;
        if (data.base_url) createData.base_url = data.base_url;

        const llmConfig = await llmConfigsRepository.create(createData);

        return llmConfig;
    }

    async getLLMConfigs(
        userId: string,
        page: number = 1,
        limit: number = 10
    ): Promise<IUserLLMConfigsResponse> {
        const { llmConfigs, total } = await llmConfigsRepository.findByUserId(userId, page, limit);
        return {
            data: llmConfigs,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getLLMConfigById(userId: string, llmConfigId: string): Promise<ILLMConfigResponse> {
        const llmConfig = await llmConfigsRepository.findOne({
            _id: llmConfigId,
            user_id: userId,
        });

        if (!llmConfig) {
            throw new NotFoundError("The requested LLM configuration could not be found or you don't have permission to access it.");
        }

        return llmConfig;
    }

    async deleteLLMConfig(userId: string, llmConfigId: string): Promise<void> {
        const llmConfig = await llmConfigsRepository.findOne({
            _id: llmConfigId,
            user_id: userId,
        });

        if (!llmConfig) {
            throw new NotFoundError("LLM configuration not found");
        }

        await llmConfigsRepository.deleteById(llmConfigId);
    }

    async updateLLMConfig(
        userId: string,
        llmConfigId: string,
        data: UpdateLLMConfigRequest
    ): Promise<ILLMConfigResponse> {
        const llmConfig = await llmConfigsRepository.findOne({
            _id: llmConfigId,
            user_id: userId,
        });

        if (!llmConfig) {
            throw new NotFoundError("Cannot update: The LLM configuration does not exist or access is denied.");
        }

        const updates: Partial<ILLMConfig> = {};
        if (data.model_name) updates.model_name = data.model_name;
        if (data.provider) updates.provider = data.provider;
        if (data.api_key !== undefined) updates.api_key = data.api_key;
        if (data.base_url !== undefined) updates.base_url = data.base_url;

        if (Object.keys(updates).length > 0) {
            await llmConfigsRepository.updateById(llmConfigId, updates);
        }

        const finalConfig = await llmConfigsRepository.findById(llmConfigId);
        return finalConfig!;
    }
}

export const userLLMConfigsService = new UserLLMConfigsService();
