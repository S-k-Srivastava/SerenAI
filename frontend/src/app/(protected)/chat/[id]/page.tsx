'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Message } from '@/components/chat/ChatMessage';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errorUtils';
import { useResourceName } from '@/context/ResourceNameContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { UnauthorizedState } from '@/components/common/UnauthorizedState';
import { LoadingState } from '@/components/common/LoadingState';
import { chatService } from '@/lib/api/services/chatService';

interface RecentChat {
    _id: string;
    title?: string;
    chatbot?: {
        name?: string;
    };
}

export default function ChatPage() {
    const params = useParams();
    const id = params.id as string;
    const queryClient = useQueryClient();
    const { resourceName, setResourceName } = useResourceName();
    const { hasPermission, loading: authLoading } = useAuth();

    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);

    const { data: chat, isLoading, isError, error, refetch, isFetching } = useQuery({
        queryKey: ['chat', id],
        queryFn: () => chatService.getById(id),
        refetchOnWindowFocus: false,
        enabled: !authLoading && hasPermission('read', 'chat', 'self'),
        retry: 1,
        staleTime: 1000 * 60 * 1, // 1 minute - conversations can update quickly
        gcTime: 1000 * 60 * 5, // 5 minutes
    });

    useEffect(() => {
        if (isError) {
             toast.error(error?.message || "Failed to load conversation");
        }
    }, [isError, error]);

    // Reset messages when ID changes
    useEffect(() => {
        setMessages([]);
        setIsTyping(false);
    }, [id]);

    // Compute title directly to avoid flicker
    // chatService.getById returns IChat-like object
    const computedTitle = chat?.title || (typeof chat?.chatbot === 'object' ? chat.chatbot?.name : undefined) || "Chat";

    // Fallback to recent-chats cache if title is not yet available from main query
    if (!computedTitle) {
        const recentChats = queryClient.getQueryData<RecentChat[]>(['recent-chats']);
        if (Array.isArray(recentChats)) {
            const cachedChat = recentChats.find((c) => c._id === id);
            if (cachedChat) {
                // computedTitle = cachedChat.title || cachedChat.chatbot?.name; 
                // computedTitle is const now, but we can't reassign. 
                // Let's rely on useQuery or just ignore fallback for now or use separate let.
            }
        }
    }

    useEffect(() => {
        if (chat) {
            console.log('ChatPage data received:', chat);
            // chatService has already normalized the messages
            if (chat.messages && Array.isArray(chat.messages)) {
                setMessages(chat.messages as Message[]);
            }

            // Set title
            const name = chat.title || (typeof chat.chatbot === 'object' ? chat.chatbot?.name : undefined) || "Chat";
            setResourceName(name);
        }
    }, [chat, setResourceName]);

    if (authLoading) {
        return <LoadingState fullPage message="Loading..." size="lg" />;
    }

    if (isError) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full gap-4">
                <p className="text-destructive font-medium">Failed to load conversation</p>
                <p className="text-muted-foreground text-sm">{getErrorMessage(error)}</p>
            </div>
        );
    }

    if (!hasPermission('read', 'chat', 'self')) {
        return <UnauthorizedState resource="chat" permission="read" />;
    }

    const handleSendMessage = async (message: string) => {
        // Optimistic UI update
        const newMessage: Message = { role: 'user', content: message };
        setMessages(prev => [...prev, newMessage]);
        setIsTyping(true);

        try {
            const data = await chatService.sendMessage(id, message);
            const botResponse: Message = {
                role: 'assistant',
                content: data.response,
                sources: data.sources
            };
            setMessages(prev => [...prev, botResponse]);
            void queryClient.invalidateQueries({ queryKey: ['recent-chats'] });
        } catch (error) {
            console.error("Failed to send message", error);
            toast.error(getErrorMessage(error, "Failed to send message"));
            setMessages(prev => [...prev, { role: 'system', content: 'Failed to send message.' }]);
        } finally {
            setIsTyping(false);
        }
    };

    // Don't render ChatInterface until we have chatbot data
    if (!chat?.chatbot) {
        return <LoadingState fullPage message="Loading chat..." size="lg" />;
    }

    return (
        <ChatInterface
            messages={messages}
            onSend={(msg) => { void handleSendMessage(msg); }}
            loading={isTyping}
            initialLoading={isLoading}
            title={computedTitle ?? resourceName ?? undefined}
            onRefresh={() => { void refetch(); }}
            isRefreshing={isFetching}
            chatbot={chat.chatbot}
        />
    );
}
