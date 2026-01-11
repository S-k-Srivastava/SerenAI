import api from "@/lib/api";
import { IApiResponse, IContactUs, IContactUsFormData, ContactUsResponse, ContactUsStatus } from "@/types/api";

export const contactUsService = {
  // Public endpoint - no auth required
  create: async (payload: IContactUsFormData) => {
    const { data } = await api.post<IApiResponse<{ contactUs: IContactUs }>>("/contact-us", payload);
    return data.data.contactUs;
  },

  // Admin endpoints
  getAll: async (params?: { page?: number; limit?: number; status?: ContactUsStatus; search?: string }) => {
    const { data } = await api.get<IApiResponse<ContactUsResponse>>("/admin/contact-us", { params });
    return data.data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<IApiResponse<{ contactUs: IContactUs }>>(`/admin/contact-us/${id}`);
    return data.data.contactUs;
  },

  updateStatus: async (id: string, status: ContactUsStatus) => {
    const { data } = await api.patch<IApiResponse<{ contactUs: IContactUs }>>(
      `/admin/contact-us/${id}/status`,
      { status }
    );
    return data.data.contactUs;
  },
};
