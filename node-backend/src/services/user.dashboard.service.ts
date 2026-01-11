import { documentsRepository } from "../repositories/documents.repository.js";
import { chatbotsRepository } from "../repositories/chatbots.repository.js";
import { conversationsRepository } from "../repositories/conversations.repository.js";
import { IUserDashboardService } from "./interfaces/IUserDashboardService.js";
import { IUserDashboardStatsResponse } from "../types/index.js";
import mongoose from "mongoose";

export class UserDashboardService implements IUserDashboardService {
    async getStats(userId: string): Promise<IUserDashboardStatsResponse> {
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const [documentCount, chatbotCount, conversationCount] = await Promise.all([
            documentsRepository.count({ user_id: userObjectId }),
            chatbotsRepository.count({ user_id: userObjectId }),
            conversationsRepository.count({ user_id: userObjectId })
        ]);

        return {
            documents: documentCount,
            chatbots: chatbotCount,
            conversations: conversationCount
        };
    }
}

export const userDashboardService = new UserDashboardService();
