import { Request, Response } from "express";
import { PublicChatsService } from "../services/public.chats.service.js";
import { asyncHandler } from "../utils/helpers/asyncHandler.js";
import { sendSuccess } from "../utils/helpers/responseHelper.js";

const publicChatsService = new PublicChatsService();

export const startConversation = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId, chatbotId } = req.params;

    const conversation = await publicChatsService.startConversation(sessionId || "", chatbotId || "");

    sendSuccess(res, { conversationId: conversation._id, messages: conversation.messages }, "Conversation started successfully");
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const { sessionId, conversationId } = req.params;
    const { message } = req.body;

    const result = await publicChatsService.sendMessage(sessionId || "", conversationId || "", message || "");

    sendSuccess(res, result, "Message sent successfully");
});

export const getChatbot = asyncHandler(async (req: Request, res: Response) => {
    const { chatbotId } = req.params;

    const chatbot = await publicChatsService.getChatbot(chatbotId || "");

    sendSuccess(res, chatbot, "Chatbot retrieved successfully");
});
