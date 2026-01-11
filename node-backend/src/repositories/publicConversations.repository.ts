import { QueryOptions, ClientSession } from "mongoose";
import { BaseRepository } from "./BaseRepository.js";
import PublicConversation, { IPublicConversation } from "../models/PublicConversation.js";
import { IPublicConversationsRepository } from "./interfaces/IPublicConversationsRepository.js";

export class PublicConversationsRepository extends BaseRepository<IPublicConversation> implements IPublicConversationsRepository {
    constructor() {
        super(PublicConversation);
    }

    async findBySessionAndChatBot(sessionId: string, chatbotId: string, options?: QueryOptions & { session?: ClientSession }): Promise<IPublicConversation | null> {
        return await this.findOne({ session_id: sessionId, chatbot_id: chatbotId }, options);
    }
}

export const publicConversationsRepository = new PublicConversationsRepository();
