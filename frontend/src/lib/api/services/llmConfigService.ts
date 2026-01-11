import api from '@/lib/api';
import { CreateLLMConfigData, LLMConfigsResponse, ILLMConfig, UpdateLLMConfigData } from '@/types/llmconfig';
import { IApiResponse } from '@/types/api';

export const llmConfigService = {
    getAll: async (params?: Record<string, string | number | undefined>) => {
        const response = await api.get<IApiResponse<LLMConfigsResponse>>('/llmconfigs', { params });
        return response.data.data;
    },

    getById: async (id: string) => {
        const response = await api.get<IApiResponse<{ llmConfig: ILLMConfig }>>(`/llmconfigs/${id}`);
        return response.data.data.llmConfig;
    },

    create: async (data: CreateLLMConfigData) => {
        const response = await api.post<IApiResponse<{ llmConfig: ILLMConfig }>>('/llmconfigs', data);
        return response.data.data.llmConfig;
    },

    update: async (id: string, data: UpdateLLMConfigData) => {
        const response = await api.put<IApiResponse<{ llmConfig: ILLMConfig }>>(`/llmconfigs/${id}`, data);
        return response.data.data.llmConfig;
    },

    delete: async (id: string) => {
        const response = await api.delete<IApiResponse<{ message: string }>>(`/llmconfigs/${id}`);
        return response.data.data;
    }
};
