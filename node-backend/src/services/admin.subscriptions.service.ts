import { subscriptionsRepository } from "../repositories/subscriptions.repository.js";
import { plansRepository } from "../repositories/plans.repository.js";
import { usageQuotasRepository } from "../repositories/usage_quotas.repository.js";
import { chatbotsRepository } from "../repositories/chatbots.repository.js";
import { documentsRepository } from "../repositories/documents.repository.js";
import { ISubscription, ISubscriptionWithUsageQuotasAndPlan, SubscriptionStatus } from "../models/Subscription.js";
import { BadRequestError, NotFoundError } from "../errors/index.js";
import mongoose from "mongoose";

import { IAdminSubscriptionsService } from "./interfaces/IAdminSubscriptionsService.js";
import { ISubscriptionResponse, ISubscriptionsResponse } from "../types/index.js";

import { CreateSubscriptionRequest } from "../schemas/subscription.js";

export class AdminSubscriptionsService implements IAdminSubscriptionsService {
    async createSubscription(data: CreateSubscriptionRequest): Promise<ISubscriptionResponse> {
        const { user_id: userId, plan_id: planId } = data;
        // 1. Check for existing active subscription
        const existingActive = await subscriptionsRepository.findActiveByUserId(userId);
        if (existingActive) {
            throw new BadRequestError("User already has an active subscription.");
        }

        // 2. Get Plan details for duration
        const plan = await plansRepository.findById(planId);
        if (!plan) {
            throw new NotFoundError("Plan not found");
        }
        
        if (!plan.isActive) {
             throw new BadRequestError("Cannot subscribe to an inactive plan");
        }

        // 3. Calculate end date
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + plan.duration);

        // 4. Create Subscription with Quota using Transaction
        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const subscriptionData = {
                user_id: new mongoose.Types.ObjectId(userId),
                plan_id: new mongoose.Types.ObjectId(planId),
                start_date: startDate,
                end_date: endDate,
                status: SubscriptionStatus.ACTIVE
            };

            const subscription = await subscriptionsRepository.create(subscriptionData, { session });
            
            // Create Quota
            const quotaData = {
                subscription_id: subscription._id as mongoose.Types.ObjectId,
                max_chatbot_count: plan.max_chatbot_count,
                max_document_count: plan.max_document_count,
                max_word_count_per_document: plan.max_word_count_per_document,
                max_chatbot_shares: plan.max_chatbot_shares,
                is_public_chatbot_allowed: plan.is_public_chatbot_allowed
            };

            await usageQuotasRepository.create(quotaData, { session });

            await session.commitTransaction();
            return subscription;
        } catch (error) {
            await session.abortTransaction();
            throw error;
        } finally {
            await session.endSession();
        }
    }

    async getSubscriptionsByUserId(userId: string): Promise<ISubscriptionsResponse> {
        // 1. Fetch all subscriptions
        const subscriptions = await subscriptionsRepository.findByUserId(userId);

        // 2. Fetch Usage Data and Quotas in parallel (optimized batch queries)
        const subscriptionIds = subscriptions.map(sub => (sub._id as mongoose.Types.ObjectId).toString());

        const [chatbotCount, documentCount, allChatbots, allQuotas] = await Promise.all([
            chatbotsRepository.count({ user_id: new mongoose.Types.ObjectId(userId) }),
            documentsRepository.count({ user_id: new mongoose.Types.ObjectId(userId) }),
            chatbotsRepository.find({ user_id: new mongoose.Types.ObjectId(userId) }),
            // Fetch all quotas for this user's subscriptions in one query
            usageQuotasRepository.find({ subscription_id: { $in: subscriptionIds.map(id => new mongoose.Types.ObjectId(id)) } })
        ]);

        const usedChatbotShares = allChatbots.reduce((acc, bot) => acc + (bot.shared_with ? bot.shared_with.length : 0), 0);

        // Create quota lookup map for O(1) access
        const quotaMap = new Map(
            allQuotas.map(quota => [quota.subscription_id.toString(), quota])
        );

        const now = new Date();

        // Check for expired subscriptions and update in batch
        const expiredSubscriptions = subscriptions.filter(
            sub => sub.status === SubscriptionStatus.ACTIVE && sub.end_date < now
        );

        if (expiredSubscriptions.length > 0) {
            await Promise.all(
                expiredSubscriptions.map(sub =>
                    subscriptionsRepository.updateById(
                        (sub._id as mongoose.Types.ObjectId).toString(),
                        { status: SubscriptionStatus.EXPIRED }
                    )
                )
            );
        }

        // Build results without additional DB calls
        const results: ISubscriptionWithUsageQuotasAndPlan[] = subscriptions.map(sub => {
            const subObj = sub.toObject() as unknown as Record<string, unknown>;

            // Update status if expired
            if (sub.status === SubscriptionStatus.ACTIVE && sub.end_date < now) {
                subObj.status = SubscriptionStatus.EXPIRED;
            }

            // Rename plan_id -> plan
            if (subObj.plan_id) {
                subObj.plan = subObj.plan_id;
                delete subObj.plan_id;
            }

            // Get quota from map (O(1) lookup)
            const quota = quotaMap.get((sub._id as mongoose.Types.ObjectId).toString());

            subObj.usage_quotas = {
                ...(quota ? quota.toObject() : {}),
                used_chatbot_count: chatbotCount,
                used_document_count: documentCount,
                used_chatbot_shares: usedChatbotShares
            };

            return subObj as unknown as ISubscriptionWithUsageQuotasAndPlan;
        });

        return results;
    }

    async cancelSubscription(subscriptionId: string): Promise<ISubscriptionResponse> {
        const subscription = await subscriptionsRepository.findById(subscriptionId);
        if (!subscription) {
            throw new NotFoundError("Subscription not found");
        }

        if (subscription.status !== SubscriptionStatus.ACTIVE) {
             throw new BadRequestError("Only active subscriptions can be cancelled");
        }

        return await subscriptionsRepository.updateById(subscriptionId, { status: SubscriptionStatus.CANCELLED }) as ISubscription;
    }
}
