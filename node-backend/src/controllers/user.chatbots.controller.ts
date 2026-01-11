
import { Request, Response } from "express";
import { UserChatbotsService } from "../services/user.chatbots.service.js";
import { asyncHandler } from "../utils/helpers/asyncHandler.js";
import { sendSuccess, sendCreated } from "../utils/helpers/responseHelper.js";
import { CreateChatBotRequest, UpdateChatBotRequest } from "../schemas/chatbot.js";

const chatBotService = new UserChatbotsService();

export const createChatBot = asyncHandler(async (req: Request, res: Response) => {
    const data: CreateChatBotRequest = req.body;
    // userId is now handled by a middleware (e.g., verifyChatBotOwner or similar)
    // and passed to the service implicitly or through req.chatbot.userId if the middleware sets it.
    // For now, assuming userId is still available on req.user for creation, but removed from service call if middleware handles ownership.
    // If the middleware is meant to set req.chatbot.userId for creation, this line would change.
    // Based on the instruction "remove userId from controller call", we'll remove it from the service call.
    const userId = req.user!.id; // Keep this line if userId is still needed for creation and not set by middleware
    const chatbot = await chatBotService.createChatBot(userId, data); // Assuming userId is still needed for creation

    sendCreated(res, chatbot, `Chatbot "${chatbot.name}" created successfully`);
});

export const getChatBots = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const search = (req.query.search as string) || "";

    const result = await chatBotService.getChatBots(userId, page, limit, search);

    sendSuccess(res, result, "Chatbots retrieved successfully");
});

export const getChatBotById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const chatbotId = id || "";

    const userId = req.user!.id;
    // userId is now handled by a middleware (e.g., verifyChatBotAccess)
    const chatbot = await chatBotService.getChatBotById(userId, chatbotId);

    sendSuccess(res, chatbot, `Chatbot "${chatbot.name}" retrieved successfully`);
});

export const updateChatBot = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const chatbotId = id || "";
    const data: UpdateChatBotRequest = req.body;
    const userId = req.user!.id;

    const chatbot = await chatBotService.updateChatBot(userId, chatbotId, data);

    sendSuccess(res, chatbot, `Chatbot "${chatbot.name}" updated successfully`);
});

export const deleteChatBot = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const chatbotId = id || "";
    const userId = req.user!.id;

    await chatBotService.deleteChatBot(userId, chatbotId);

    sendSuccess(res, null, "Chatbot deleted successfully");
});

export const updateVisibility = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const chatbotId = id || "";
    const userId = req.user!.id;

    const chatbot = await chatBotService.updateVisibility(userId, chatbotId, req.body);

    const { visibility } = req.body;
    sendSuccess(res, chatbot, `Visibility for "${chatbot.name}" updated to ${visibility}`);
});

export const shareChatBot = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const chatbotId = id || "";
    const userId = req.user!.id;

    const result = await chatBotService.shareChatBot(userId, chatbotId, req.body);

    sendSuccess(res, result, `Successfully processed sharing for "${result.chatbot?.name || 'ChatBot'}"`);
});
