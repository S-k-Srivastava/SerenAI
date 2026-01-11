import api from "@/lib/api";
import { ChatbotsResponse, CreateChatbotData, UpdateChatbotData, IChatbot, ShareChatbotResponse, StartChatResponse } from "@/types/chatbot";
import { IApiResponse } from "@/types/api";

export const chatbotService = {
    getAll: async (params?: Record<string, string | number>) => {
        const { data } = await api.get<IApiResponse<ChatbotsResponse>>("/chatbots", { params });
        return data.data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<IApiResponse<IChatbot>>(`/chatbots/${id}`);
        return data.data;
    },

     // Get public chatbot details (no auth required)
    getPublicChatbotByID: async (botId: string) => {
        const response = await api.get<IApiResponse<IChatbot>>(`/public/chat/${botId}`);
        return response.data.data;
    },

    create: async (chatbotData: CreateChatbotData) => {
        const { data } = await api.post<IApiResponse<IChatbot>>("/chatbots", chatbotData);
        return data.data;
    },

    update: async (id: string, chatbotData: UpdateChatbotData) => {
        const { data } = await api.patch<IApiResponse<IChatbot>>(`/chatbots/${id}`, chatbotData);
        return data.data;
    },

    delete: async (id: string) => {
        await api.delete(`/chatbots/${id}`);
    },

    startChat: async (botId: string) => {
        const { data } = await api.post<IApiResponse<StartChatResponse>>(`/chat/${botId}/start`);
        return data.data;
    },

    share: async (id: string, emails: string[]) => {
        const { data } = await api.post<IApiResponse<ShareChatbotResponse>>(`/chatbots/${id}/share`, { emails });
        return data.data;
    }
};
