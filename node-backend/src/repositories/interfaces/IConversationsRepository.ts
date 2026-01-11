import { IConversation } from "../../models/Conversation.js";
import { FilterQuery, QueryOptions, ClientSession } from "mongoose";
import { IBaseRepository } from "./IBaseRepository.js";

export interface IConversationsRepository extends IBaseRepository<IConversation> {
    findByUserAndChatBot(userId: string, chatbotId: string, options?: QueryOptions & { session?: ClientSession }): Promise<IConversation | null>;
    getConversationsWithChatBotDetails(userId: string, page?: number, limit?: number, search?: string, options?: QueryOptions & { session?: ClientSession }): Promise<{ conversations: IConversation[]; total: number }>;
    count(filter: FilterQuery<IConversation>): Promise<number>;
}
