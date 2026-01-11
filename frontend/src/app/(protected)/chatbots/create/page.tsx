'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Bot } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errorUtils';
import { PageWrapper } from "@/components/layout/PageWrapper";
import { ChatBotForm } from '@/components/forms/ChatBotForm';
import { PageHeader } from '@/components/common/PageHeader';
import { chatbotService } from '@/lib/api/services/chatbotService';
import { IChatBotTheme, ChatbotVisibilityEnum } from '@/types/chatbot';

export default function CreateChatBotPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: {
        name: string;
        visibility: ChatbotVisibilityEnum;
        document_ids: string[];
        system_prompt?: string;
        llm_config_id?: string;
        view_source_documents?: boolean;
        temperature?: number;
        max_tokens?: number;
        theme: IChatBotTheme;
        logo?: string;
    }) => {
        setLoading(true);
        try {
            await chatbotService.create({
                name: formData.name,
                system_prompt: formData.system_prompt || "",
                document_ids: formData.document_ids,
                visibility: formData.visibility,
                is_active: true,
                llm_config_id: formData.llm_config_id,
                view_source_documents: formData.view_source_documents,
                temperature: formData.temperature,
                max_tokens: formData.max_tokens,
                theme: formData.theme,
                logo: formData.logo,
            });
            void queryClient.invalidateQueries({ queryKey: ['chatbots'] });
            toast.success("Chatbot created successfully");
            router.push('/chatbots');
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Failed to create chatbot'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <PageHeader
                icon={Bot}
                iconColor="purple"
                title="Create Chatbot"
                description="Configure your new AI assistant."
            />

            <div className="mt-6">
                <ChatBotForm
                    onSubmit={handleSubmit}
                    isLoading={loading}
                    mode="create"
                />
            </div>
        </PageWrapper>
    );
}
