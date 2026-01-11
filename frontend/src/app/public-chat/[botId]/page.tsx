'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Message } from '@/components/chat/ChatMessage';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errorUtils';
import { LoadingState } from '@/components/common/LoadingState';
import { chatService } from '@/lib/api/services/chatService';
import { chatbotService } from '@/lib/api/services/chatbotService';
import { IChatbot } from '@/types/chatbot';

export default function PublicChatPage() {
    const params = useParams();
    const botId = params.botId as string;

    const [conversationId, setConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [chatbot, setChatbot] = useState<IChatbot | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initChat = async () => {
            try {
                setInitializing(true);

                // Fetch chatbot details
                const botData = await chatbotService.getPublicChatbotByID(botId);

                // Check if chatbot is PUBLIC
                if (botData.visibility !== 'PUBLIC') {
                    setError('This chatbot is not publicly accessible');
                    return;
                }

                setChatbot(botData);

                // Start public conversation
                const { conversationId: convId, messages: history } = await chatService.startPublic(botId);
                setConversationId(convId);

                // Load existing messages if any
                if (history && history.length > 0) {
                    const formattedMessages: Message[] = history.map((msg: { role: string; content: string }) => ({
                        role: msg.role as 'user' | 'assistant' | 'system',
                        content: msg.content
                    }));
                    setMessages(formattedMessages);
                }
            } catch (err) {
                console.error('Failed to initialize public chat', err);
                setError(getErrorMessage(err, 'Failed to load chatbot'));
                toast.error('Failed to load chatbot');
            } finally {
                setInitializing(false);
            }
        };

        void initChat();
    }, [botId]);

    const handleSendMessage = async (message: string) => {
        if (!conversationId) return;

        // Optimistic UI update
        const newMessage: Message = { role: 'user', content: message };
        setMessages(prev => [...prev, newMessage]);
        setIsTyping(true);

        try {
            const data = await chatService.sendPublicMessage(conversationId, message);
            const botResponse: Message = {
                role: 'assistant',
                content: data.response,
                sources: data.sources
            };
            setMessages(prev => [...prev, botResponse]);
        } catch (err) {
            console.error("Failed to send message", err);
            toast.error(getErrorMessage(err, "Failed to send message"));
            setMessages(prev => [...prev, { role: 'system', content: 'Failed to send message.' }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (initializing) {
        return <LoadingState fullPage message="Loading chatbot..." size="lg" />;
    }

    if (error || !chatbot || !conversationId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full gap-4">
                <p className="text-destructive font-medium">{error || 'Failed to load chatbot'}</p>
            </div>
        );
    }

    return (
        <ChatInterface
            messages={messages}
            onSend={(msg) => { void handleSendMessage(msg); }}
            loading={isTyping}
            initialLoading={false}
            title={chatbot.name}
            chatbot={chatbot}
            isPublic={true}
        />
    );
}
