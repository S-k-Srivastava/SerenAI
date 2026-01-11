import { CreateChatBotRequest, UpdateChatBotRequest, UpdateVisibilityRequest, ShareChatBotRequest } from "../../schemas/chatbot.js";
import { IChatBotResponse, IUserChatBotsResponse, IShareChatBotResponse } from "../../types/index.js";

export interface IUserChatbotsService {
    createChatBot(userId: string, data: CreateChatBotRequest): Promise<IChatBotResponse>;
    getChatBots(userId: string, page?: number, limit?: number, search?: string): Promise<IUserChatBotsResponse>;
    getChatBotById(userId: string, chatBotId: string): Promise<IChatBotResponse>;
    updateChatBot(userId: string, chatBotId: string, data: UpdateChatBotRequest): Promise<IChatBotResponse>;
    deleteChatBot(userId: string, chatBotId: string): Promise<void>;
    updateVisibility(userId: string, chatBotId: string, data: UpdateVisibilityRequest): Promise<IChatBotResponse>;
    shareChatBot(userId: string, chatBotId: string, data: ShareChatBotRequest): Promise<IShareChatBotResponse>;
}
