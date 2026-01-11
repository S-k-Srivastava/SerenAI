import { UsageEventType } from "../../models/UsageEvent.js";
import { ClientSession } from "mongoose";

export interface IUsageEventsService {
    createEvent(
        userId: string,
        modelName: string,
        provider: string,
        tokenCount: number,
        eventType: UsageEventType,
        session?: ClientSession
    ): Promise<void>;

    getEventStats(startDate: Date, endDate: Date): Promise<Array<{
        date: string;
        provider: string;
        model_name: string;
        total_tokens: number;
        event_type: UsageEventType;
    }>>;
}
