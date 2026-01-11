import { UpdateConversationTitleRequest } from "../../schemas/chat.js";
import { IConversationResponse, IChatResponse, IConversationHistoryResponse, IUserConversationsResponse } from "../../types/index.js";

export interface IUserChatsService {
    startNewConversation(userId: string, chatbotId: string): Promise<IConversationResponse>;
    getAllConversations(userId: string, page?: number, limit?: number, search?: string): Promise<IUserConversationsResponse>;
    updateConversationTitle(userId: string, conversationId: string, data: UpdateConversationTitleRequest): Promise<IConversationResponse>;
    getConversation(userId: string, conversationId: string): Promise<IConversationHistoryResponse>;
    deleteConversation(userId: string, conversationId: string): Promise<void>;
    chatWithConversationId(userId: string, conversationId: string, message: string): Promise<IChatResponse>;
}
