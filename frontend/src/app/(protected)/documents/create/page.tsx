'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errorUtils';
import { PageWrapper } from "@/components/layout/PageWrapper";
import { DocumentForm, DocumentFormValues } from '@/components/forms/DocumentForm';
import { PageHeader } from '@/components/common/PageHeader';
import { documentService } from '@/lib/api/services/documentService';
import { Chunk } from '@/lib/utils/semanticChunker';

export default function CreateDocumentPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (formData: DocumentFormValues, chunks: Chunk[]) => {
        if (!formData.name.trim()) {
            toast.error("Document name is required");
            return;
        }
        if (!formData.description?.trim()) {
            toast.error("Description is required");
            return;
        }
        if (chunks.length === 0) {
            toast.error("Please upload a document");
            return;
        }

        setLoading(true);
        try {
            await documentService.create({
                name: formData.name,
                description: formData.description,
                chunks: chunks.map(chunk => ({
                    id: chunk.id,
                    content: chunk.content,
                    index: chunk.index,
                    metadata: chunk.metadata
                })),
                labels: formData.labels || [],
                visibility: formData.visibility
            });
            void queryClient.invalidateQueries({ queryKey: ['documents'] });
            toast.success("Document created successfully");
            router.push('/documents');
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Failed to create document'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <PageWrapper>
            <PageHeader
                icon={FileText}
                iconColor="blue"
                title="Create Document"
                description="Add text content to your knowledge base."
            />

            <div className="mt-6">
                <DocumentForm
                    onSubmit={handleSubmit}
                    isLoading={loading}
                    mode="create"
                />
            </div>
        </PageWrapper>
    );
}
