import { IPublicConversation } from "../../models/PublicConversation.js";
import { IChatResponse } from "../../types/index.js";
import { IChatBot } from "../../models/ChatBot.js";

export interface IPublicConversationResponse extends IPublicConversation {
    _id: string;
}

export interface IPublicChatsService {
    getChatbot(chatbotId: string): Promise<IChatBot>;
    startConversation(sessionId: string, chatbotId: string): Promise<IPublicConversationResponse>;
    sendMessage(sessionId: string, conversationId: string, message: string): Promise<IChatResponse>;
}
