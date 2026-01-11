import { Request, Response } from "express";
import { UserChatsService } from "../services/user.chats.service.js";
import { asyncHandler } from "../utils/helpers/asyncHandler.js";
import { sendSuccess } from "../utils/helpers/responseHelper.js";

const chatService = new UserChatsService();

export const getAllConversations = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || "";

    const result = await chatService.getAllConversations(userId, page, limit, search);

    sendSuccess(res, result, "Conversations retrieved successfully");
});

export const updateConversationTitle = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const conversationId = req.params.id || "";

    const conversation = await chatService.updateConversationTitle(userId, conversationId, req.body);

    sendSuccess(res, conversation, "Conversation title updated successfully");
});

export const startConversation = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { chatbotId } = req.params;
    const cId = chatbotId || "";

    // Use startNewConversation to ensure a fresh thread is created
    const conversation = await chatService.startNewConversation(userId, cId);

    sendSuccess(res, { conversationId: conversation._id }, "Conversation started successfully");
});

export const getConversation = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const conversationId = req.params.id || "";

    const conversation = await chatService.getConversation(userId, conversationId);

    sendSuccess(res, conversation, "Conversation retrieved successfully");
});

export const sendMessageToConversation = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const conversationId = req.params.id || "";
    const { message } = req.body;

    const result = await chatService.chatWithConversationId(userId, conversationId, message || "");

    sendSuccess(res, result, "Message sent successfully");
});

export const deleteConversation = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const conversationId = id || "";

    await chatService.deleteConversation(userId, conversationId);

    sendSuccess(res, null, "Conversation deleted successfully");
});
