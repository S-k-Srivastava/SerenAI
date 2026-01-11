import api from "@/lib/api";
import { IApiResponse, ILoginResponse } from "@/types/api";

import { IUser } from "@/types/user";
import { LoginData, RegisterData, UpdateProfileData } from "@/types/auth";

export const authService = {
    login: async (data: LoginData) => {
        const response = await api.post<IApiResponse<ILoginResponse>>('/auth/login', data);
        return response.data;
    },

    register: async (data: RegisterData) => {
        const response = await api.post<IApiResponse<ILoginResponse>>('/auth/register', data);
        return response.data;
    },

    getMe: async () => {
        const response = await api.get<IApiResponse<{ user: IUser }>>('/auth/me');
        return response.data.data.user;
    },

    updateProfile: async (data: UpdateProfileData) => {
        const response = await api.put<IApiResponse<{ user: IUser }>>('/auth/profile', data);
        return response.data;
    },

    // SSO methods
    googleSSORegister: async (token: string, firstName: string, lastName: string) => {
        const response = await api.post<IApiResponse<ILoginResponse>>('/auth/sso/google/register', {
            token,
            firstName,
            lastName
        });
        return response.data;
    },

    googleSSOLogin: async (token: string) => {
        const response = await api.post<IApiResponse<ILoginResponse>>('/auth/sso/google/login', {
            token
        });
        return response.data;
    }
};
