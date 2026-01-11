import api from "@/lib/api";
import { IApiResponse } from "@/types/api";
import { AdminStats } from "@/types/admin";

export const adminService = {
    getStats: async (startDate: Date, endDate: Date) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate.toISOString());
        if (endDate) params.append('endDate', endDate.toISOString());
        
        const { data } = await api.get<IApiResponse<AdminStats>>(`/admin/stats?${params.toString()}`);
        return data.data;
    }
};
