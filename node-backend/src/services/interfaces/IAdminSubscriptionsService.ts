import { CreateSubscriptionRequest } from "../../schemas/subscription.js";
import { ISubscriptionResponse, ISubscriptionsResponse } from "../../types/index.js";

export interface IAdminSubscriptionsService {
    createSubscription(data: CreateSubscriptionRequest): Promise<ISubscriptionResponse>;
    getSubscriptionsByUserId(userId: string): Promise<ISubscriptionsResponse>;
    cancelSubscription(subscriptionId: string): Promise<ISubscriptionResponse>;
}
