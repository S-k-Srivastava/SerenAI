import { Request, Response } from "express";
import { AdminSubscriptionsService } from "../services/admin.subscriptions.service.js";
import { asyncHandler } from "../utils/helpers/asyncHandler.js";
import { sendSuccess, sendCreated } from "../utils/helpers/responseHelper.js";
import { CreateSubscriptionRequest } from "../schemas/subscription.js";

const subscriptionService = new AdminSubscriptionsService();

export const createSubscription = asyncHandler(async (req: Request, res: Response) => {
    const data: CreateSubscriptionRequest = req.body;
    
    // User ID comes from body as this is an Admin action assigning to a user
    const subscription = await subscriptionService.createSubscription(data);

    sendCreated(res, subscription, "Subscription created successfully");
});

export const getUserSubscriptions = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.params;
    if (!userId) throw new Error("User ID required"); // Should be caught by route param check usually

    const subscriptions = await subscriptionService.getSubscriptionsByUserId(userId);

    sendSuccess(res, subscriptions, "User subscriptions retrieved successfully");
});

export const cancelSubscription = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    
    const subscription = await subscriptionService.cancelSubscription(id!);

    sendSuccess(res, subscription, "Subscription cancelled successfully");
});
