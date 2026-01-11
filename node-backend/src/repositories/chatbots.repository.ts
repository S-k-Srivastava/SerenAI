import { BaseRepository } from "./BaseRepository.js";
import ChatBot, { IChatBot } from "../models/ChatBot.js";
import { FilterQuery, QueryOptions, ClientSession } from "mongoose";
import { IChatbotsRepository } from "./interfaces/IChatbotsRepository.js";

export class ChatbotsRepository extends BaseRepository<IChatBot> implements IChatbotsRepository {
    constructor() {
        super(ChatBot);
    }

    async findPopulated(filter: FilterQuery<IChatBot>, skip: number = 0, limit: number = 10, sort: Record<string, 1 | -1> = { createdAt: -1 }, options?: QueryOptions & { session?: ClientSession }): Promise<IChatBot[]> {
        return await this.model.find(filter, null, options)
            .populate('user_id', 'firstName lastName')
            .populate('document_ids', 'name')
            .populate('shared_with', 'firstName lastName email')
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .exec();
    }

    async findByIdPopulated(id: string, options?: QueryOptions & { session?: ClientSession }): Promise<IChatBot | null> {
        return await this.model.findById(id, null, options)
            .populate('user_id', 'firstName lastName')
            .populate('document_ids', 'name')
            .populate('shared_with', 'firstName lastName email')
            .exec();
    }
}

export const chatbotsRepository = new ChatbotsRepository();
