import api from "@/lib/api";
import { IApiResponse } from "@/types/api";

import { DashboardStats } from "@/types/dashboard";

export const dashboardService = {
    getStats: async () => {
        const response = await api.get<IApiResponse<DashboardStats>>('/dashboard');
        return response.data.data;
    }
};
