'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Server } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errorUtils';
import { PageWrapper } from "@/components/layout/PageWrapper";
import { LLMConfigForm, LLMConfigFormValues } from '@/components/forms/LLMConfigForm';
import { useResourceName } from '@/context/ResourceNameContext';
import { llmConfigService } from '@/lib/api/services/llmConfigService';
import { LLMProviderEnum } from '@/types/llmconfig';

export default function EditLLMConfigPage() {
    const router = useRouter();
    const params = useParams();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [initialData, setInitialData] = useState<{
        model_name: string;
        provider: LLMProviderEnum;
        api_key?: string;
        base_url?: string;
    } | null>(null);
    const { setResourceName } = useResourceName();

    const { data: config, isLoading: initialLoading, isError, error } = useQuery({
        queryKey: ['llmconfig', params.id],
        queryFn: async () => {
            return llmConfigService.getById(params.id as string);
        },
        enabled: !!params.id,
        staleTime: 0,
        refetchOnMount: true
    });

    useEffect(() => {
        if (isError) {
            toast.error(error?.message || "Failed to load LLM configuration");
        }
    }, [isError, error]);

    useEffect(() => {
        return () => setResourceName(null);
    }, [setResourceName]);

    useEffect(() => {
        if (config) {
            setInitialData({
                model_name: config.model_name,
                provider: config.provider,
                api_key: config.api_key,
                base_url: config.base_url,
            });
            setResourceName(config.model_name);
        }
    }, [config, setResourceName]);

    const handleSubmit = async (formData: LLMConfigFormValues) => {
        setLoading(true);
        try {
            await llmConfigService.update(params.id as string, {
                model_name: formData.model_name,
                provider: formData.provider,
                api_key: formData.api_key,
                base_url: formData.base_url,
            });
            void queryClient.invalidateQueries({ queryKey: ['llmconfigs'] });
            toast.success("LLM configuration updated successfully");
            router.push('/llmconfigs');
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Failed to update LLM configuration'));
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
                </div>
            </PageWrapper>
        )
    }

    return (
        <PageWrapper>
            <div className="grid gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                        <Server className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit LLM Configuration</h1>
                        <p className="text-muted-foreground">Manage details for &quot;{initialData?.model_name}&quot;.</p>
                    </div>
                </div>

                <LLMConfigForm
                    initialData={initialData || undefined}
                    onSubmit={handleSubmit}
                    isLoading={loading}
                    mode="edit"
                />
            </div>
        </PageWrapper>
    );
}
