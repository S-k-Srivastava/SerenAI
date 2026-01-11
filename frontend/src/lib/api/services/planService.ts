import api from "@/lib/api";
import { CreatePlanData, IPlan, PlansResponse, UpdatePlanData } from "@/types/plan";
import { IApiResponse } from "@/types/api";

export const planService = {
    getAll: async (params?: Record<string, string | number>) => {
        const { data } = await api.get<IApiResponse<PlansResponse>>("/admin/plans", { params });
        return data.data;
    },

    getPublicPlans: async () => {
        const { data } = await api.get<IApiResponse<{ plans: IPlan[] }>>("/plans/public");
        return data.data.plans;
    },

    getById: async (id: string) => {
        const { data } = await api.get<IApiResponse<{ plan: IPlan }>>(`/admin/plans/${id}`);
        return data.data.plan;
    },

    create: async (payload: CreatePlanData) => {
        const { data } = await api.post<IApiResponse<{ plan: IPlan }>>("/admin/plans", payload);
        return data.data.plan;
    },

    update: async (id: string, payload: UpdatePlanData) => {
        const { data } = await api.put<IApiResponse<{ plan: IPlan }>>(`/admin/plans/${id}`, payload);
        return data.data.plan;
    },

    delete: async (id: string) => {
        const { data } = await api.delete<IApiResponse<null>>(`/admin/plans/${id}`);
        return data;
    }
};
