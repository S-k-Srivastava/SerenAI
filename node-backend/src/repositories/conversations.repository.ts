import mongoose, { FilterQuery, PipelineStage, QueryOptions, ClientSession, AggregateOptions } from "mongoose";
import { BaseRepository } from "./BaseRepository.js";
import Conversation, { IConversation } from "../models/Conversation.js";
import { IConversationsRepository } from "./interfaces/IConversationsRepository.js";

export class ConversationsRepository extends BaseRepository<IConversation> implements IConversationsRepository {
    constructor() {
        super(Conversation);
    }

    async findByUserAndChatBot(userId: string, chatbotId: string, options?: QueryOptions & { session?: ClientSession }): Promise<IConversation | null> {
        return await this.findOne({ user_id: userId, chatbot_id: chatbotId }, options);
    }

    async getConversationsWithChatBotDetails(userId: string, page: number = 1, limit: number = 10, search?: string, options?: QueryOptions & { session?: ClientSession }): Promise<{ conversations: IConversation[]; total: number }> {
        const skip = (page - 1) * limit;

        const matchStage: FilterQuery<IConversation> = { user_id: new mongoose.Types.ObjectId(userId) };

        const pipeline: PipelineStage[] = [
            { $match: matchStage },
            {
                $lookup: {
                    from: "chatbots",
                    localField: "chatbot_id",
                    foreignField: "_id",
                    as: "chatbot"
                }
            },
            { $unwind: "$chatbot" } as PipelineStage
        ];

        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { "chatbot.name": { $regex: search, $options: "i" } },
                        { "title": { $regex: search, $options: "i" } }
                    ]
                }
            });
        }

        pipeline.push({ $sort: { last_message_at: -1 } });

        // Count total before pagination (Clone pipeline or use facet? Count is separate query usually but in agg pipeline it's tricky to get both total and paginated data without facet)
        // Original code did separate count. It was inefficient if filter was complex but here we reuse pipeline logic?
        // Actually original code did:
        // const countPipeline = [...pipeline, { $count: "total" }];
        // const countResult = await this.model.aggregate(countPipeline);
        
        // Pass options to aggregate
        const aggOptions = options as unknown as AggregateOptions;

        const countPipeline = [...pipeline, { $count: "total" }];
        const countResult = await this.model.aggregate(countPipeline).option(aggOptions);
        const total = countResult.length > 0 ? countResult[0].total : 0;

        // Apply pagination
        pipeline.push({ $skip: skip });
        pipeline.push({ $limit: limit });

        pipeline.push({
            $project: {
                _id: 1,
                user_id: 1,
                chatbot: "$chatbot",
                title: 1,
                messages: 1,
                last_message_at: 1,
                created_at: 1,
                updated_at: 1
            }
        });

        const conversations = await this.model.aggregate<IConversation>(pipeline).option(aggOptions);

        return { conversations, total };
    }
}

export const conversationsRepository = new ConversationsRepository();
