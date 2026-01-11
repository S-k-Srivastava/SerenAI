import { IUsageEvent, UsageEventType } from "../../models/UsageEvent.js";
import { IBaseRepository } from "./IBaseRepository.js";
import { QueryOptions, ClientSession } from "mongoose";

export interface IUsageEventsRepository extends IBaseRepository<IUsageEvent> {
    getStats(startDate: Date, endDate: Date, options?: QueryOptions & { session?: ClientSession }): Promise<Array<{
        date: string;
        provider: string;
        model_name: string;
        total_tokens: number;
        event_type: UsageEventType;
    }>>;
}
