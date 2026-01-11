import api from '@/lib/api';
import { ChatsResponse, IChat, UpdateChatTitleData, SendMessageResponse, RawChatResponse } from '@/types/chat';
import { IApiResponse } from '@/types/api';
import { getOrCreateSessionId } from '@/lib/utils/sessionId';

export const chatService = {
    // Get all conversations (paginated)
    getAll: async (params?: Record<string, string | number>) => {
        const response = await api.get<IApiResponse<ChatsResponse>>('/chat', { params });
        return response.data.data;
    },

    // Get a single chat by ID
    getById: async (id: string) => {
        const response = await api.get<IApiResponse<RawChatResponse>>(`/chat/conversations/${id}`);
        // Handle variable response structure
        const payload = response.data.data; // API wrapper
        const history = payload.history || payload;

        // Normalize to IChat-like structure
        // This is a best-effort normalization based on client observation
        return {
            ...history,
            _id: id,
            messages: Array.isArray(history?.messages) ? history.messages : (Array.isArray(history) ? history : []),
            title: history?.title,
            chatbot: history?.chatbot,
        } as IChat;
    },

    // Create a new chat (start chat)
    start: async (botId: string) => {
        const response = await api.post<IApiResponse<{ conversation_id: string; chat: IChat }>>(`/chat/${botId}/start`);
        return response.data.data;
    },

    // Start a public conversation
    startPublic: async (botId: string) => {
        const sessionId = getOrCreateSessionId();
        const response = await api.post<IApiResponse<{ conversationId: string; messages: Array<{ role: string; content: string }> }>>(`/public/chat/${sessionId}/${botId}/start`);
        return response.data.data;
    },

    // Send a message
    sendMessage: async (chatId: string, message: string) => {
        const response = await api.post<IApiResponse<SendMessageResponse>>(`/chat/conversations/${chatId}/message`, { message });
        return response.data.data;
    },

    // Send a message to public conversation
    sendPublicMessage: async (chatId: string, message: string) => {
        const sessionId = getOrCreateSessionId();
        const response = await api.post<IApiResponse<SendMessageResponse>>(`/public/chat/${sessionId}/${chatId}/message`, { message });
        return response.data.data;
    },

    // Update chat title
    updateTitle: async (id: string, data: UpdateChatTitleData) => {
        const response = await api.patch<IApiResponse<{ data: IChat }>>(`/chat/conversations/${id}/title`, data);
        return response.data.data;
    },

    // Delete chat
    delete: async (id: string) => {
        const response = await api.delete<IApiResponse<{ message: string }>>(`/chat/conversations/${id}`);
        return response.data.data;
    }
};
