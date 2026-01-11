import api from "@/lib/api";
import { IApiResponse } from "@/types/api";
import { CreateUserData, IUser, UpdateUserData, UsersResponse } from "@/types/user";

export const userService = {
    getAll: async (params?: Record<string, string | number>) => {
        const { data } = await api.get<IApiResponse<UsersResponse>>("/admin/users", { params });
        return data.data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<IApiResponse<{ user: IUser }>>(`/admin/users/${id}`);
        return data.data.user;
    },

    create: async (payload: CreateUserData) => {
        const { data } = await api.post<IApiResponse<{ user: IUser }>>("/admin/users", payload);
        return data.data.user;
    },

    update: async (id: string, payload: UpdateUserData) => {
        const { data } = await api.put<IApiResponse<{ user: IUser }>>(`/admin/users/${id}`, payload);
        return data.data.user;
    },

    delete: async (id: string) => {
        const { data } = await api.delete<IApiResponse<null>>(`/admin/users/${id}`);
        return data;
    },

    assignRoles: async (userId: string, roleIds: string[]) => {
        const { data } = await api.put<IApiResponse<{ user: IUser }>>(`/admin/users/${userId}/roles`, { roleIds });
        return data.data.user;
    }
};
