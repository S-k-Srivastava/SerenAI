import api from "@/lib/api";
import { IApiResponse, IPermission } from "@/types/api";
import { CreateRoleData, IRole, RolesResponse, UpdateRoleData } from "@/types/role";

export const roleService = {
    getAll: async (params?: Record<string, string | number>) => {
        const { data } = await api.get<IApiResponse<RolesResponse>>("/admin/roles", { params });
        return data.data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<IApiResponse<IRole>>(`/admin/roles/${id}`);
        return data.data;
    },

    create: async (payload: CreateRoleData) => {
        const { data } = await api.post<IApiResponse<IRole>>("/admin/roles", payload);
        return data.data;
    },

    update: async (id: string, payload: UpdateRoleData) => {
        const { data } = await api.put<IApiResponse<IRole>>(`/admin/roles/${id}`, payload);
        return data.data;
    },

    delete: async (id: string) => {
        const { data } = await api.delete<IApiResponse<null>>(`/admin/roles/${id}`);
        return data;
    },

    getPermissions: async () => {
        const { data } = await api.get<IApiResponse<IPermission[]>>("/admin/roles/permissions");
        return data.data;
    }
};
