'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useSearchFilter } from '@/hooks/useSearchFilter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, FileText, Clock, Layers, Pencil, MoreVertical } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { LoadingState } from '@/components/common/LoadingState';
import { UnauthorizedState } from '@/components/common/UnauthorizedState';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { ResourceCard, ActionItem } from '@/components/common/ResourceCard';
import { ResourceTable } from '@/components/common/ResourceTable';
import { useViewMode } from '@/context/ViewModeContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardTabLayout } from '@/components/layout/DashboardTabLayout';
import { ResourceGrid } from '@/components/common/ResourceGrid';
import { EmptyState } from '@/components/common/EmptyState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { documentService } from '@/lib/api/services/documentService';
import { IDocument, DocumentsResponse } from '@/types/document';
import { getErrorMessage } from "@/lib/errorUtils";
import { MultiSelectFilter } from '@/components/common/MultiSelectFilter';


export default function DocumentsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { hasPermission, loading: authLoading } = useAuth();
    const { searchTerm: search, debouncedSearch, setSearchTerm: setSearch } = useSearchFilter();
    const [page, setPage] = useState(1);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const { viewMode } = useViewMode();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    
    // Derived state from URL
    const selectedLabels = React.useMemo(() => {
        const labelsParam = searchParams.get('labels');
        return labelsParam ? labelsParam.split(',') : [];
    }, [searchParams]);

    // Update URL helper
    const setSelectedLabels = (newLabels: string[]) => {
        const params = new URLSearchParams(searchParams.toString());
        if (newLabels.length > 0) {
            params.set('labels', newLabels.join(','));
        } else {
            params.delete('labels');
        }
        params.set('page', '1'); // Reset to page 1 on filter change
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    };
    const [availableLabels, setAvailableLabels] = useState<string[]>([]);

    const { data: response, isLoading: loading, isFetching, refetch, isError, error } = useQuery<DocumentsResponse>({
        queryKey: ['documents', debouncedSearch, page, selectedLabels],
        queryFn: async () => {
            return documentService.getAll({
                search: debouncedSearch,
                page,
                limit: 12,
                labels: selectedLabels.length > 0 ? selectedLabels.join(',') : undefined
            });
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 20,
        enabled: !authLoading && hasPermission('read', 'document', 'self'),
    });

    // Fetch available labels
    useEffect(() => {
        const fetchLabels = async () => {
            try {
                const labels = await documentService.getLabels();
                setAvailableLabels(labels);
            } catch (err) {
                console.error("Failed to fetch labels", err);
            }
        };
        void fetchLabels();
    }, []);

    useEffect(() => {
        if (isError) {
             toast.error(error?.message || "Failed to load documents");
        }
    }, [isError, error]);

    const documents = response?.data || [];
    // Server-side filtering
    const filteredDocs = documents;

    // Table Columns Definition
    const columns = [
        {
            header: "Name",
            accessorKey: "name",
            width: 300,
            cell: (doc: IDocument) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-orange-500/10 text-orange-600 shrink-0">
                        <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-medium truncate">{doc.name}</span>
                </div>
            )
        },
        {
            header: "Labels",
            width: 200,
            cell: (doc: IDocument) => (
                <div className="flex flex-wrap gap-1">
                    {doc.labels?.map(label => (
                         <Badge key={label} variant="secondary" className="px-1.5 py-0 text-[10px] font-normal">
                            {label}
                        </Badge>
                    ))}
                </div>
            )
        },
        {
            header: "Status",
            width: 130,
            cell: (doc: IDocument) => {
                const status = doc.metadata?.status || 'unknown';
                const getStatusVariant = (status: string) => {
                    switch (status.toLowerCase()) {
                        case 'indexed':
                            return { variant: 'outline' as const, className: 'bg-success/10 text-success border-success/20' };
                        case 'processing':
                        case 'pending':
                            return { variant: 'outline' as const, className: 'bg-warning/10 text-warning border-warning/20' };
                        case 'failed':
                            return { variant: 'outline' as const, className: 'bg-destructive/10 text-destructive border-destructive/20' };
                        default:
                            return { variant: 'outline' as const, className: 'bg-muted text-muted-foreground border-muted' };
                    }
                };
                const statusConfig = getStatusVariant(status);
                return (
                    <Badge variant={statusConfig.variant} className={statusConfig.className}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                );
            }
        },
        {
            header: "Chunks",
            width: 100,
            cell: (doc: IDocument) => (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Layers className="w-3.5 h-3.5 opacity-60" />
                    <span>{doc.metadata?.chunk_count || 0}</span>
                </div>
            )
        },
        {
            header: "Last Modified",
            width: 180,
            cell: (doc: IDocument) => (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 opacity-60" />
                    <span className="whitespace-nowrap">
                        {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : 'N/A'}
                    </span>
                </div>
            )
        },
        {
            header: "Actions",
            width: 80,
            align: 'center' as const,
            cell: (doc: IDocument) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost-premium" size="icon" className="h-7 w-7">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem asChild>
                                <Link href={`/documents/${doc._id}/edit`} className="cursor-pointer">
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onSelect={() => setDeleteId(doc._id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    if (authLoading) {
        return <LoadingState fullPage message="Loading documents..." size="lg" />;
    }

    if (!hasPermission('read', 'document', 'self')) {
        return <UnauthorizedState resource="documents" permission="read" />;
    }

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await documentService.delete(deleteId);
            toast.success("Document deleted successfully");
            void queryClient.invalidateQueries({ queryKey: ['documents'] });
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to delete document"));
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <DashboardTabLayout
            title="Documents"
            icon={FileText}
            description="Manage your knowledge base and training data"
            search={{
                value: search,
                onChange: setSearch,
                placeholder: "Search documents..."
            }}
            refresh={{
                onRefresh: () => { void refetch(); },
                isRefreshing: isFetching
            }}
            create={{
                label: "Add Document",
                href: "/documents/create",
                permission: "create:document:self"
            }}
            pagination={{
                currentPage: page,
                totalPages: response?.pagination.totalPages || 1,
                onPageChange: setPage,
                isLoading: loading || isFetching,
                totalItems: response?.pagination.total || 0,
            }}
        >
            <div className="mb-4">
                <MultiSelectFilter
                    options={availableLabels}
                    selectedValues={selectedLabels}
                    onSelectionChange={setSelectedLabels}
                    placeholder="Filter by Label..."
                    searchPlaceholder="Search label..."
                    emptyMessage="No label found."
                    multiSelect={true}
                />
            </div>

            {loading ? (
                <ResourceGrid count={8}>
                    {[...Array(8)].map((_, i) => (
                        <Card key={i} className="flex flex-row items-center p-4 border-muted/40 shadow-sm overflow-hidden">
                            <Skeleton className="h-14 w-14 rounded-2xl shrink-0 mr-4" />
                            <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-5 w-1/2" />
                                    <Skeleton className="h-5 w-16 rounded-full" />
                                </div>
                                <div className="flex gap-4">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </ResourceGrid>
            ) : filteredDocs.length === 0 ? (
                <EmptyState
                    icon={FileText}
                    title="No Documents Found"
                    description={search ? "No documents match your search criteria." : "Add documents to enhance your chatbots with custom knowledge."}
                    action={{
                        label: "Add Document",
                        onClick: () => router.push('/documents/create'),
                        permission: "create:document:self"
                    }}
                />
            ) : viewMode === 'table' ? (
                <ResourceTable<IDocument>
                    data={filteredDocs}
                    columns={columns}
                    onRowClick={(doc) => router.push(`/documents/${doc._id}`)}
                />
            ) : (
                <ResourceGrid count={filteredDocs.length}>
                    {filteredDocs.map(doc => {
                        const docStatus = doc.metadata?.status || 'unknown';
                        const getStatusConfig = (status: string) => {
                            switch (status.toLowerCase()) {
                                case 'indexed':
                                    return { label: 'Indexed', variant: 'success' as const, className: 'bg-success/10 text-success border-success/20' };
                                case 'processing':
                                case 'pending':
                                    return { label: status.charAt(0).toUpperCase() + status.slice(1), variant: 'warning' as const, className: 'bg-warning/10 text-warning border-warning/20' };
                                case 'failed':
                                    return { label: 'Failed', variant: 'destructive' as const, className: 'bg-destructive/10 text-destructive border-destructive/20' };
                                default:
                                    return { label: status.charAt(0).toUpperCase() + status.slice(1), variant: 'secondary' as const, className: 'bg-muted text-muted-foreground border-muted' };
                            }
                        };

                        const actions: ActionItem[] = [
                            {
                                label: "Edit",
                                icon: Pencil,
                                onClick: () => router.push(`/documents/${doc._id}/edit`),
                            },
                            {
                                label: "Delete",
                                icon: Trash2,
                                onClick: () => setDeleteId(doc._id),
                                variant: "destructive",
                            }
                        ];

                        return (
                            <ResourceCard
                                key={doc._id}
                                title={doc.name}
                                icon={FileText}
                                iconClassName="bg-primary/10 text-primary"
                                accentColor="primary"
                                status={getStatusConfig(docStatus)}
                                metaItems={[
                                    { icon: Layers, label: `${doc.metadata?.chunk_count || 0} chunks` },
                                    { icon: Clock, label: doc.created_at ? new Date(doc.created_at).toLocaleDateString() : 'N/A' }
                                ]}
                                onClick={() => router.push(`/documents/${doc._id}`)}
                                footer={
                                    <span className="opacity-70 whitespace-nowrap">
                                        {doc.updated_at ? new Date(doc.updated_at).toLocaleDateString() : 'N/A'}
                                    </span>
                                }
                                actions={actions}
                            >
                                {doc.labels && doc.labels.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                        {doc.labels.map(label => (
                                            <Badge key={label} variant="outline" className="px-1.5 py-0 text-[10px] font-normal text-primary bg-primary/5 border-primary/20 hover:bg-primary/10 transition-colors">
                                                {label}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </ResourceCard>
                        );
                    })}
                </ResourceGrid>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Are you absolutely sure?"
                description="This will permanently delete the document. This action cannot be undone."
                confirmText="Delete Document"
                variant="destructive"
                onConfirm={() => { void confirmDelete(); }}
            />

        </DashboardTabLayout>
    );
}
