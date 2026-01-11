import { IPublicConversation } from "../../models/PublicConversation.js";
import { IBaseRepository } from "./IBaseRepository.js";
import { QueryOptions, ClientSession } from "mongoose";

export interface IPublicConversationsRepository extends IBaseRepository<IPublicConversation> {
    findBySessionAndChatBot(sessionId: string, chatbotId: string, options?: QueryOptions & { session?: ClientSession }): Promise<IPublicConversation | null>;
}
