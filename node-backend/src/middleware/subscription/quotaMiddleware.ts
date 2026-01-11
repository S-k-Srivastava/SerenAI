import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../../errors/index.js';
import { subscriptionsRepository } from '../../repositories/subscriptions.repository.js';
import mongoose from 'mongoose';
import { ISubscription } from '../../models/Subscription.js';
import UsageQuota from '../../models/UsageQuota.js';
import ChatBot from '../../models/ChatBot.js';
import Document from '../../models/Document.js';
import { isWithinWordCountQuota } from '../../utils/textUtils.js';

export enum QuotaEnum {
    CHATBOT = 'chatbot',
    DOCUMENT = 'document',
    CHATBOT_SHARE = 'chatbot_share',
}

export const checkQuota = (resource: QuotaEnum) => {
    return async (req: Request, _res: Response, next: NextFunction) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            const userId = req.user?.id;
            if (!userId) {
                throw new ForbiddenError("User not authenticated");
            }

            // 1. Get active subscription
            const subscription = await subscriptionsRepository.findActiveByUserId(userId) as ISubscription;
            if (!subscription) {
                throw new ForbiddenError("No active subscription found. Please subscribe to a plan.");
            }

            // 2. Get usage quota
            let quotaLimit: {
                max_chatbot_count: number;
                max_chatbot_shares: number;
                max_document_count: number;
                max_word_count_per_document: number;
                is_public_chatbot_allowed: boolean;
            };

            const usageQuota = await UsageQuota.findOne({
                subscription_id: subscription._id as mongoose.Types.ObjectId
            }).session(session);
            
            if (usageQuota) {
                quotaLimit = {
                    max_chatbot_count: usageQuota.max_chatbot_count,
                    max_chatbot_shares: usageQuota.max_chatbot_shares,
                    max_document_count: usageQuota.max_document_count,
                    max_word_count_per_document: usageQuota.max_word_count_per_document,
                    is_public_chatbot_allowed: usageQuota.is_public_chatbot_allowed,
                };
            } else {
                throw new ForbiddenError("Usage limits could not be verified. Please contact support via Help.");
            }

            const userObjectId = new mongoose.Types.ObjectId(userId);

            // -----------------------------------------------------------------------
            // CHATBOT QUOTA CHECK
            // -----------------------------------------------------------------------
            if (resource === QuotaEnum.CHATBOT) {
                const currentCount = await ChatBot.countDocuments({ user_id: userObjectId }).session(session);
                if (currentCount >= quotaLimit.max_chatbot_count) {
                    throw new ForbiddenError(`Chatbot limit reached (${quotaLimit.max_chatbot_count}). Please upgrade your plan.`);
                }
            }

            // -----------------------------------------------------------------------
            // DOCUMENT QUOTA CHECK
            // -----------------------------------------------------------------------
            if (resource === QuotaEnum.DOCUMENT) {
                const currentCount = await Document.countDocuments({ user_id: userObjectId }).session(session);
                if (currentCount >= quotaLimit.max_document_count) {
                    throw new ForbiddenError(`Document limit reached (${quotaLimit.max_document_count}). Please upgrade your plan.`);
                }

                // Check word count from chunks
                let textContent = '';
                
                if (req.body.chunks && Array.isArray(req.body.chunks)) {
                    textContent = req.body.chunks.map((c: {content:string}) => c.content || '').join(' ');
                } else {
                    throw new ForbiddenError("Missing document content chunks for quota validation.");
                }

                if (!textContent || textContent.trim().length === 0) {
                     throw new ForbiddenError("Document content cannot be empty.");
                }

                const isWithinLimit = isWithinWordCountQuota(textContent, quotaLimit.max_word_count_per_document, 5); // 5% tolerance
                if (!isWithinLimit) {
                     throw new ForbiddenError(`Document word count limit exceeded (${quotaLimit.max_word_count_per_document} words). Please reduce the content or create another Document.`);
                }
            }

            // -----------------------------------------------------------------------
            // CHATBOT SHARE QUOTA CHECK
            // -----------------------------------------------------------------------
            if (resource === QuotaEnum.CHATBOT_SHARE) {
                // Get all chatbots owned by the user to sum their shares
                const userChatbots = await ChatBot.find({ user_id: userObjectId }).session(session);
                const currentTotalShares = userChatbots.reduce((sum, bot) => sum + (bot.shared_with?.length || 0), 0);
                
                // Count new shares in the current request
                const newEmails = req.body.emails || (req.body.email ? [req.body.email] : []);
                const newSharesCount = newEmails.length;

                if (currentTotalShares + newSharesCount > quotaLimit.max_chatbot_shares) {
                    throw new ForbiddenError(`Chatbot share limit reached. Total allowed: ${quotaLimit.max_chatbot_shares}. Current: ${currentTotalShares}, Attempting: ${newSharesCount}.`);
                }
            }

            await session.commitTransaction();
            return next();
        } catch (error) {
            await session.abortTransaction();
            return next(error);
        } finally {
            await session.endSession();
        }
    };
};
