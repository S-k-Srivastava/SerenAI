'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FileText, Calendar, Hash, Eye, EyeOff, Layers } from 'lucide-react';
import { toast } from 'sonner';
import { PageWrapper } from "@/components/layout/PageWrapper";
import { useResourceName } from '@/context/ResourceNameContext';
import { documentService } from '@/lib/api/services/documentService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from 'next/link';
import { ChunkViewer } from "@/components/common/ChunkViewer";
import { Chunk } from '@/lib/utils/semanticChunker';
import { DocumentChunk, DocumentVisibilityEnum } from '@/types/document';

export default function ViewDocumentPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { setResourceName } = useResourceName();

    // Initialize search query from URL param
    const initialSearchQuery = searchParams?.get('search') || '';
    const [searchQuery, setSearchQuery] = useState(initialSearchQuery);

    const { data: doc, isLoading, isError, error } = useQuery({
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
        if (doc) {
            setResourceName(doc.name);
        }
        return () => setResourceName(null);
    }, [doc, setResourceName]);

    if (isLoading) {
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
        );
    }

    if (!doc) {
        return (
            <PageWrapper>
                <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Document not found</h2>
                    <p className="text-muted-foreground mb-6">The document you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
                    <Link href="/documents">
                        <Button>Go to Documents</Button>
                    </Link>
                </div>
            </PageWrapper>
        );
    }

    const chunks: Chunk[] = doc.chunks?.map((chunk: DocumentChunk) => ({
        id: chunk.chunk_id,
        content: chunk.content,
        index: chunk.chunk_index,
        metadata: {
            characterCount: chunk.metadata.characterCount,
            wordCount: chunk.metadata.wordCount
        }
    })) || [];

    return (
        <PageWrapper>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-start justify-between border-b pb-6">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary shadow-sm">
                            <FileText className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{doc.name}</h1>
                            <p className="text-muted-foreground mt-1.5 text-base">View document details and content</p>
                        </div>
                    </div>
                </div>

                {/* Document Overview Section */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Document Overview</h2>
                        <p className="text-sm text-muted-foreground mt-1">General information and metadata</p>
                    </div>

                    {/* First Row: 2 Columns */}
                    <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
                    {/* Document Details Card */}
                    <Card className="border-muted/40 shadow-sm">
                        <CardHeader className="pb-4 border-b bg-muted/5">
                            <CardTitle className="text-xl">Document Information</CardTitle>
                            <CardDescription>Metadata and content details</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-1.5">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Title</span>
                                <div className="text-sm font-medium">{doc.name}</div>
                            </div>

                            <Separator />

                            <div className="space-y-1.5">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Description</span>
                                <div className="text-sm text-foreground/80">{doc.description}</div>
                            </div>

                            <Separator />

                            <div className="space-y-1.5">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Labels</span>
                                <div className="flex flex-wrap gap-2">
                                    {doc.labels && doc.labels.length > 0 ? (
                                        doc.labels.map((label, index) => (
                                            <Badge key={index} variant="secondary" className="text-xs">
                                                <Hash className="h-3 w-3 mr-1" />
                                                {label}
                                            </Badge>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground">No labels</span>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-1.5">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Visibility</span>
                                <div className="flex items-center gap-2">
                                    {doc.visibility === DocumentVisibilityEnum.PUBLIC ? (
                                        <>
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                            <Badge variant="default">Public</Badge>
                                            <span className="text-xs text-muted-foreground">Anyone can view this document</span>
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            <Badge variant="secondary">Private</Badge>
                                            <span className="text-xs text-muted-foreground">Only you can access this document</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sidebar Metadata */}
                    <Card className="border-muted/40 shadow-sm">
                        <CardHeader className="pb-4 border-b bg-muted/5">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                Metadata
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-1.5">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Status</span>
                                <div className="flex items-center gap-2">
                                    <Badge variant={doc.metadata?.status === 'indexed' ? 'default' : 'secondary'} className="capitalize">
                                        {doc.metadata?.status || 'Unknown'}
                                    </Badge>
                                    <div className={`w-2 h-2 rounded-full ${doc.metadata?.status === 'indexed' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
                                </div>
                            </div>

                            <Separator className="bg-muted/40" />

                            <div className="space-y-1.5">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Chunks</span>
                                <div className="flex items-center gap-2">
                                    <Layers className="h-4 w-4 text-muted-foreground" />
                                    <div className="text-sm font-semibold">
                                        {doc.metadata?.chunk_count || 0} segments
                                    </div>
                                </div>
                            </div>

                            <Separator className="bg-muted/40" />

                            <div className="space-y-1.5">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Size</span>
                                <div className="text-sm font-medium">
                                    {doc.metadata?.file_size ? `${(doc.metadata.file_size / 1024).toFixed(1)} KB` : chunks.length > 0 ? `~${(chunks.reduce((sum, c) => sum + c.metadata.characterCount, 0) / 1024).toFixed(1)} KB` : 'N/A'}
                                </div>
                            </div>

                            <Separator className="bg-muted/40" />

                            <div className="space-y-1.5">
                                <span className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    Created
                                </span>
                                <div className="text-sm font-medium">
                                    {new Date(doc.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>

                            <div className="space-y-1.5 font-mono text-[10px] break-all text-muted-foreground leading-relaxed pt-2">
                                <div className="flex justify-between">
                                    <span>ID:</span>
                                    <span>{doc._id}</span>
                                </div>
                            </div>

                            <Separator className="bg-muted/40" />

                            <div className="flex flex-col gap-3">
                                {doc.is_owner && (
                                    <Link href={`/documents/${doc._id}/edit`} className="w-full">
                                        <Button variant="outline" className="w-full">Edit Document</Button>
                                    </Link>
                                )}
                                <Link href="/documents" className="w-full">
                                    <Button variant="ghost" className="w-full">Back to Documents</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                </div>

                {/* Separator */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-muted" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-4 text-muted-foreground font-medium tracking-wider">Document Content</span>
                    </div>
                </div>

                {/* Content Section */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Chunks & Content</h2>
                        <p className="text-sm text-muted-foreground mt-1">Explore the indexed document segments</p>
                    </div>

                    {/* Second Row: Full Width Chunks */}
                    <ChunkViewer
                        chunks={chunks}
                        mode="view"
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                    />
                </div>
            </div>
        </PageWrapper>
    );
}
