import { BaseRepository } from "./BaseRepository.js";
import Subscription, { ISubscription, SubscriptionStatus } from "../models/Subscription.js";
import mongoose, { QueryOptions, ClientSession } from "mongoose";
import { ISubscriptionsRepository } from "./interfaces/ISubscriptionsRepository.js";

export class SubscriptionsRepository extends BaseRepository<ISubscription> implements ISubscriptionsRepository {
    constructor() {
        super(Subscription);
    }

    async findActiveByUserId(userId: string, options?: QueryOptions & { session?: ClientSession }): Promise<ISubscription | null> {
        return this.model.findOne({
            user_id: new mongoose.Types.ObjectId(userId),
            status: SubscriptionStatus.ACTIVE,
            end_date: { $gt: new Date() } // Ensure it's not expired based on time as well
        }, null, options).populate('plan_id');
    }

    async findByUserId(userId: string, options?: QueryOptions & { session?: ClientSession }): Promise<ISubscription[]> {
        return this.model.find({
            user_id: new mongoose.Types.ObjectId(userId)
        }, null, options).sort({ createdAt: -1 }).populate('plan_id');
    }
    
    // Override findById to populate plan
    async findByIdPopulated(id: string, options?: QueryOptions & { session?: ClientSession }): Promise<ISubscription | null> {
         return this.model.findById(id, null, options).populate('plan_id');
    }
}

export const subscriptionsRepository = new SubscriptionsRepository();
