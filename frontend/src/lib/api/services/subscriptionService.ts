import api from "../../api";
import { IApiResponse } from "../../../types/api";
import { ISubscription } from "../../../types/subscription";

export const subscriptionService = {
    getUserSubscriptions: async (userId: string): Promise<ISubscription[]> => {
        const { data } = await api.get<IApiResponse<{ data: ISubscription[] }>>(`/admin/subscriptions/user/${userId}`);
        // The API returns { data: { data: [...] } } or { data: [...] } ?
        // Based on test_admin_api.sh: GET /subscriptions/user/:userId returns { data: [...] } ?
        // Let's check api.ts or response wrapper.
        // Usually data.data.
        return (data.data as unknown) as ISubscription[]; 
        // Note: The generic IApiResponse usually wraps { data: T, error, status, message }.
        // If the endpoint returns { data: [..] }, then T is ISubscription[].
        // If the endpoint returns { data: { subscriptions: [...] } }, then T is { subscriptions: ... }.
        // My controller returns `res.status(200).json(new ApiResponse(200, subscriptions, ...))`
        // So data.data IS the array.
    },

    createSubscription: async (userId: string, planId: string): Promise<ISubscription> => {
        const { data } = await api.post<IApiResponse<{ subscription: ISubscription }>>("/admin/subscriptions", { user_id: userId, plan_id: planId });
        return data.data.subscription;
    },

    cancelSubscription: async (subscriptionId: string): Promise<ISubscription> => {
        const { data } = await api.delete<IApiResponse<{ subscription: ISubscription }>>(`/admin/subscriptions/${subscriptionId}`);
        return data.data.subscription;
    }
};
