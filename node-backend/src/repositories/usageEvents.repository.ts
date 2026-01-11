import { IUsageEvent, UsageEvent, UsageEventType } from "../models/UsageEvent.js";
import { BaseRepository } from "./BaseRepository.js";
import { IUsageEventsRepository } from "./interfaces/IUsageEventsRepository.js";
import { QueryOptions, ClientSession, AggregateOptions } from "mongoose";


export class UsageEventsRepository extends BaseRepository<IUsageEvent> implements IUsageEventsRepository {
    constructor() {
        super(UsageEvent);
    }

    async getStats(startDate: Date, endDate: Date, options?: QueryOptions & { session?: ClientSession }): Promise<Array<{
        date: string; // YYYY-MM-DD
        provider: string;
        model_name: string;
        total_tokens: number;
        event_type: UsageEventType;
    }>> {
        // Cast options to any for aggregate consistency
        const aggOptions = options as unknown as AggregateOptions;
        return this.model.aggregate([
            {
                $match: {
                    created_at: { $gte: startDate, $lte: endDate }
                }
            },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
                        provider: "$provider",
                        model_name: "$model_name",
                        event_type: "$event_type"
                    },
                    total_tokens: { $sum: "$token_count" }
                }
            },
            {
                $project: {
                    _id: 0,
                    date: "$_id.date",
                    provider: "$_id.provider",
                    model_name: "$_id.model_name",
                    event_type: "$_id.event_type",
                    total_tokens: 1
                }
            },
            { $sort: { date: 1 } }
        ]).option(aggOptions);
    }
}

export const usageEventsRepository = new UsageEventsRepository();
