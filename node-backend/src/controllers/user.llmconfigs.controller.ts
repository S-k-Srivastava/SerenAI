import { Request, Response } from "express";
import { UserLLMConfigsService } from "../services/user.llmconfigs.service.js";
import { sendSuccess, sendCreated } from "../utils/helpers/responseHelper.js";
import { asyncHandler } from "../utils/helpers/asyncHandler.js";
import { CreateLLMConfigRequest, UpdateLLMConfigRequest } from "../schemas/llmconfig.js";

const userLLMConfigsService = new UserLLMConfigsService();

export const createLLMConfig = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const data: CreateLLMConfigRequest = req.body;
    const llmConfig = await userLLMConfigsService.createLLMConfig(userId, data);

    sendCreated(res, { llmConfig }, "LLM configuration created successfully");
});

export const getLLMConfigs = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await userLLMConfigsService.getLLMConfigs(userId, page, limit);
    sendSuccess(res, result, "LLM configurations retrieved successfully");
});

export const getLLMConfigById = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    const llmConfig = await userLLMConfigsService.getLLMConfigById(userId, id!);
    sendSuccess(res, { llmConfig }, "LLM configuration retrieved successfully");
});

export const updateLLMConfig = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const data: UpdateLLMConfigRequest = req.body;

    const llmConfig = await userLLMConfigsService.updateLLMConfig(userId, id!, data);
    sendSuccess(res, { llmConfig }, "LLM configuration updated successfully");
});

export const deleteLLMConfig = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;

    await userLLMConfigsService.deleteLLMConfig(userId, id!);
    sendSuccess(res, null, "LLM configuration deleted successfully");
});
