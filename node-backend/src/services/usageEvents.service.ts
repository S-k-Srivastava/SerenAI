import { usageEventsRepository } from "../repositories/usageEvents.repository.js";
import { UsageEventType } from "../models/UsageEvent.js";
import mongoose, { ClientSession } from "mongoose";
import logger from "../utils/logger/index.js";
import { IUsageEventsService } from "./interfaces/IUsageEventsService.js";

export class UsageEventsService implements IUsageEventsService {
    async createEvent(
        userId: string,
        modelName: string,
        provider: string,
        tokenCount: number,
        eventType: UsageEventType,
        session?: ClientSession
    ) {
        try {
            const options = session ? { session } : undefined;
            await usageEventsRepository.create({
                user_id: new mongoose.Types.ObjectId(userId),
                model_name: modelName,
                provider: provider,
                token_count: tokenCount,
                event_type: eventType
            }, options);
        } catch (error) {
            // Usage tracking failure should not block the main operation, log error and continue
            logger.error(`[UsageEventsService] Failed to create usage event: ${error}`);
        }
    }

    async getEventStats(startDate: Date, endDate: Date) {
        return usageEventsRepository.getStats(startDate, endDate);
    }
}

export const usageEventsService = new UsageEventsService();
