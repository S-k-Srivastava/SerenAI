'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Bot } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errorUtils';
import { Card } from '@/components/ui/card';
import { PageWrapper } from "@/components/layout/PageWrapper";
import { ChatBotForm } from '@/components/forms/ChatBotForm';
import { useResourceName } from '@/context/ResourceNameContext';
import { chatbotService } from '@/lib/api/services/chatbotService';

import { IChatBotTheme, ChatbotVisibilityEnum } from '@/types/chatbot';
import { migrateTheme } from '@/lib/themeMigration';

interface ChatBotFormData {
    name: string;
    document_ids: string[];
    documents?: { _id: string; name: string; size?: number }[];
    system_prompt: string;
    visibility: ChatbotVisibilityEnum;
    llm_config_id?: string;
    view_source_documents?: boolean;
    temperature?: number;
    max_tokens?: number;
    theme: IChatBotTheme;
    logo?: string;
}

export default function EditChatBotPage() {
    const router = useRouter();
    const params = useParams();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [initialData, setInitialData] = useState<ChatBotFormData | undefined>(undefined);
    const { setResourceName } = useResourceName();

    // Use query for fetching data
    const { data: bot, isLoading: initialLoading, isError, error } = useQuery({
        queryKey: ['chatbot', params.id],
        queryFn: async () => {
            const res = await chatbotService.getById(params.id as string);
            return res;
        },
        enabled: !!params.id,
        staleTime: 0,
        refetchOnMount: true
    });

    useEffect(() => {
        if (isError) {
             toast.error(error?.message || "Failed to load chatbot");
        }
    }, [isError, error]);

    useEffect(() => {
        return () => setResourceName(null);
    }, [setResourceName]);

    useEffect(() => {
        if (bot) {
            // Handle populated documents
            const documents = bot.documents || [];
            
            console.log("EditChatBotPage - Bot Data:", bot);

            setInitialData({
                name: bot.name,
                document_ids: documents.map((d: { _id: string }) => d._id),
                documents: documents,
                system_prompt: bot.system_prompt || "",
                visibility: bot.visibility || ChatbotVisibilityEnum.PRIVATE,
                llm_config_id: bot.llm_config_id,
                view_source_documents: bot.view_source_documents,
                temperature: bot.temperature,
                max_tokens: bot.max_tokens,
                theme: migrateTheme(bot.theme) as IChatBotTheme,
                logo: bot.logo,
            });
            setResourceName(bot.name);
        }
    }, [bot, setResourceName]);

    const handleSubmit = async (formData: ChatBotFormData) => {
        setLoading(true);
        try {
            await chatbotService.update(params.id as string, {
                name: formData.name,
                system_prompt: formData.system_prompt,
                visibility: formData.visibility,
                document_ids: formData.document_ids,
                llm_config_id: formData.llm_config_id,
                view_source_documents: formData.view_source_documents,
                temperature: formData.temperature,
                max_tokens: formData.max_tokens,
                theme: formData.theme,
                logo: formData.logo,
            });
            void queryClient.invalidateQueries({ queryKey: ['chatbots'] });
            toast.success("Chatbot updated successfully");
            router.push('/chatbots');
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Failed to update chatbot'));
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <PageWrapper>
                <div className="animate-pulse space-y-8">
                    <div className="h-4 w-32 bg-muted rounded mb-6" />
                    <div className="flex items-center gap-4 mb-8">
                        <div className="h-12 w-12 rounded-xl bg-muted" />
                        <div className="space-y-2">
                            <div className="h-8 w-48 bg-muted rounded" />
                            <div className="h-4 w-64 bg-muted rounded" />
                        </div>
                    </div>
                    <Card className="border-muted/40 overflow-hidden">
                        <div className="h-16 bg-muted/20 border-b flex items-center px-6">
                            <div className="h-5 w-32 bg-muted rounded" />
                        </div>
                        <div className="p-6 space-y-8">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2">
                                    <div className="h-4 w-24 bg-muted rounded" />
                                    <div className="h-11 w-full bg-muted/10 rounded" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-muted rounded" />
                                    <div className="h-11 w-full bg-muted/10 rounded" />
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 w-24 bg-muted rounded" />
                                    <div className="h-11 w-full bg-muted/10 rounded" />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-4 w-24 bg-muted rounded" />
                                <div className="h-60 w-full bg-muted/10 rounded" />
                            </div>
                        </div>
                    </Card>
                </div>
            </PageWrapper>
        )
    }

    return (
        <PageWrapper>
            <div className="grid gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <Bot className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Chatbot</h1>
                        <p className="text-muted-foreground">Modify settings for &quot;{initialData?.name}&quot;.</p>
                    </div>
                </div>

                <ChatBotForm
                    initialData={initialData}
                    onSubmit={handleSubmit}
                    isLoading={loading}
                    mode="edit"
                />
            </div>
        </PageWrapper>
    );
}
