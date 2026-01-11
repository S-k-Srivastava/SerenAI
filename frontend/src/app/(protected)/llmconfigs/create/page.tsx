'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Server } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errorUtils';
import { PageWrapper } from "@/components/layout/PageWrapper";
import { LLMConfigForm, LLMConfigFormValues } from '@/components/forms/LLMConfigForm';
import { PageHeader } from '@/components/common/PageHeader';
import { llmConfigService } from '@/lib/api/services/llmConfigService';

export default function CreateLLMConfigPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: LLMConfigFormValues) => {
        if (!formData.model_name.trim()) {
            toast.error("Model name is required");
            return;
        }

        setLoading(true);
        try {
            await llmConfigService.create({
                model_name: formData.model_name,
                provider: formData.provider,
                api_key: formData.api_key,
                base_url: formData.base_url,
            });
            void queryClient.invalidateQueries({ queryKey: ['llmconfigs'] });
            toast.success("LLM configuration created successfully");
            router.push('/llmconfigs');
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Failed to create LLM configuration'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <PageHeader
                icon={Server}
                iconColor="blue"
                title="Create LLM Configuration"
                description="Add a new AI model configuration."
            />

            <div className="mt-6">
                <LLMConfigForm
                    onSubmit={handleSubmit}
                    isLoading={loading}
                    mode="create"
                />
            </div>
        </PageWrapper>
    );
}
