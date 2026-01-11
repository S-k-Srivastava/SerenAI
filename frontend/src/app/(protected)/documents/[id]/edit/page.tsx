'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errorUtils';
import { PageWrapper } from "@/components/layout/PageWrapper";
import { DocumentForm, DocumentFormValues } from '@/components/forms/DocumentForm';
import { useResourceName } from '@/context/ResourceNameContext';
import { documentService } from '@/lib/api/services/documentService';
import { Chunk } from '@/lib/utils/semanticChunker';
import { DocumentChunk, DocumentVisibilityEnum } from '@/types/document';

export default function EditDocumentPage() {
    const router = useRouter();
    const params = useParams();
    const queryClient = useQueryClient();
    const [loading, setLoading] = useState(false);
    const [initialData, setInitialData] = useState<{
        name: string;
        description: string;
        visibility?: DocumentVisibilityEnum;
        _id?: string;
        created_at?: string;
        size?: number;
        metadata?: {
            status?: string;
            chunk_count?: number;
        };
        labels?: string[];
        chunks?: Chunk[];
    } | null>(null);
    const { setResourceName } = useResourceName();

    const { data: doc, isLoading: initialLoading, isError, error } = useQuery({
        queryKey: ['document', params.id],
        queryFn: async () => {
            return documentService.getById(params.id as string);
        },
        enabled: !!params.id,
        staleTime: 0,
        refetchOnMount: true
    });

    useEffect(() => {
        if (isError) {
             toast.error(error?.message || "Failed to load document");
        }
    }, [isError, error]);

    useEffect(() => {
        return () => setResourceName(null);
    }, [setResourceName]);

    useEffect(() => {
        if (doc) {
            // Convert DocumentChunk to Chunk format for the form
            const chunks: Chunk[] | undefined = doc.chunks?.map((chunk: DocumentChunk) => ({
                id: chunk.chunk_id,
                content: chunk.content,
                index: chunk.chunk_index,
                metadata: {
                    characterCount: chunk.metadata.characterCount,
                    wordCount: chunk.metadata.wordCount
                }
            }));

            setInitialData({
                name: doc.name,
                description: doc.description || '',
                visibility: doc.visibility,
                _id: doc._id,
                created_at: doc.created_at,
                size: doc.metadata?.file_size,
                metadata: {
                    status: doc.metadata?.status,
                    chunk_count: doc.metadata?.chunk_count
                },
                labels: doc.labels,
                chunks
            });
            setResourceName(doc.name);
        }
    }, [doc, setResourceName]);

    const handleSubmit = async (formData: DocumentFormValues, _chunks: Chunk[]) => {
        setLoading(true);
        try {
            // Content editing is not supported - only update metadata
            await documentService.update(params.id as string, {
                name: formData.name,
                description: formData.description,
                labels: formData.labels,
                visibility: formData.visibility
            });
            void queryClient.invalidateQueries({ queryKey: ['documents'] });
            toast.success("Document updated successfully");
            router.push('/documents');
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, 'Failed to update document'));
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
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <FileText className="h-6 w-6" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Edit Document</h1>
                        <p className="text-muted-foreground">Manage details for &quot;{initialData?.name}&quot;.</p>
                    </div>
                </div>

                <DocumentForm
                    initialData={initialData || undefined}
                    onSubmit={handleSubmit}
                    isLoading={loading}
                    mode="edit"
                />
            </div>
        </PageWrapper>
    );
}
