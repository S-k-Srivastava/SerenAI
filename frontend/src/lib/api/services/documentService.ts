import api from '@/lib/api';
import { CreateDocumentData, DocumentsResponse, IDocument, UpdateDocumentData } from '@/types/document';
import { IApiResponse } from '@/types/api';

export const documentService = {
    getAll: async (params?: Record<string, string | number | undefined>) => {
        const response = await api.get<IApiResponse<DocumentsResponse>>('/documents', { params });
        return response.data.data;
    },

    getById: async (id: string) => {
        const response = await api.get<IApiResponse<{ document: IDocument }>>(`/documents/${id}`);
        return response.data.data.document;
    },

    create: async (data: CreateDocumentData) => {
        const response = await api.post<IApiResponse<{ document: IDocument }>>('/documents', data);
        return response.data.data.document;
    },

    update: async (id: string, data: UpdateDocumentData) => {
        const response = await api.patch<IApiResponse<{ document: IDocument }>>(`/documents/${id}`, data);
        return response.data.data.document;
    },

    getLabels: async () => {
        const response = await api.get<IApiResponse<{ labels: string[] }>>('/documents/labels');
        return response.data.data.labels;
    },

    delete: async (id: string) => {
        const response = await api.delete<IApiResponse<{ message: string }>>(`/documents/${id}`);
        return response.data.data;
    }
};
