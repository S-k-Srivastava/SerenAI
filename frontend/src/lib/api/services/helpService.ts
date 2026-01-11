import api from "@/lib/api";
import { IPaginatedResult } from "@/types/common";
import { IHelp, CreateHelpData, ReplyHelpData } from "@/types/help";
import { IApiResponse } from "@/types/api";

export const helpService = {
  // User endpoints
  create: async (data: CreateHelpData): Promise<{ help: IHelp }> => {
    const response = await api.post<IApiResponse<{ help: IHelp }>>("/help", data);
    return response.data.data;
  },

  reply: async (id: string, data: ReplyHelpData): Promise<{ help: IHelp }> => {
    const response = await api.post<IApiResponse<{ help: IHelp }>>(`/help/${id}/reply`, data);
    return response.data.data;
  },

  getAll: async (params?: { page?: number; limit?: number; status?: string; search?: string }): Promise<IPaginatedResult<IHelp>> => {
    const response = await api.get<IApiResponse<IPaginatedResult<IHelp>>>("/help", { params });
    return response.data.data;
  },

  getById: async (id: string): Promise<{ help: IHelp }> => {
    const response = await api.get<IApiResponse<{ help: IHelp }>>(`/help/${id}`);
    return response.data.data;
  },

  // Admin endpoints
  getAllAdmin: async (params?: { page?: number; limit?: number; status?: string; user_id?: string; search?: string }): Promise<IPaginatedResult<IHelp>> => {
    const response = await api.get<IApiResponse<IPaginatedResult<IHelp>>>("/admin/help", { params });
    return response.data.data;
  },

  getByIdAdmin: async (id: string): Promise<{ help: IHelp }> => {
    const response = await api.get<IApiResponse<{ help: IHelp }>>(`/admin/help/${id}`);
    return response.data.data;
  },

  replyAdmin: async (id: string, data: ReplyHelpData): Promise<{ help: IHelp }> => {
    const response = await api.post<IApiResponse<{ help: IHelp }>>(`/admin/help/${id}/reply`, data);
    return response.data.data;
  },
};
