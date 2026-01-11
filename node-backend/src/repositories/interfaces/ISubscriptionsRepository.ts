import { ISubscription } from "../../models/Subscription.js";
import { IBaseRepository } from "./IBaseRepository.js";
import { QueryOptions, ClientSession } from "mongoose";

export interface ISubscriptionsRepository extends IBaseRepository<ISubscription> {
    findActiveByUserId(userId: string, options?: QueryOptions & { session?: ClientSession }): Promise<ISubscription | null>;
    findByUserId(userId: string, options?: QueryOptions & { session?: ClientSession }): Promise<ISubscription[]>;
    findByIdPopulated(id: string, options?: QueryOptions & { session?: ClientSession }): Promise<ISubscription | null>;
}
