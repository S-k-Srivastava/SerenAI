'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchFilter } from '@/hooks/useSearchFilter';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, Pencil, MoreVertical, Key, Clock, Server } from 'lucide-react';
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
import { llmConfigService } from '@/lib/api/services/llmConfigService';
import { ILLMConfig, LLMConfigsResponse } from '@/types/llmconfig';
import { getErrorMessage } from "@/lib/errorUtils";

export default function LLMConfigsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { hasPermission, loading: authLoading } = useAuth();
    const { searchTerm: search, debouncedSearch, setSearchTerm: setSearch } = useSearchFilter();
    const [page, setPage] = useState(1);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const { viewMode } = useViewMode();

    const { data: response, isLoading: loading, isFetching, refetch, isError, error } = useQuery<LLMConfigsResponse>({
        queryKey: ['llmconfigs', debouncedSearch, page],
        queryFn: async () => {
            return llmConfigService.getAll({
                search: debouncedSearch,
                page,
                limit: 12,
            });
        },
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 20,
        enabled: !authLoading && hasPermission('read', 'llm_config', 'self'),
    });

    useEffect(() => {
        if (isError) {
            toast.error(error?.message || "Failed to load LLM configurations");
        }
    }, [isError, error]);

    const configs = response?.data || [];

    // Table Columns Definition
    const columns = [
        {
            header: "Model Name",
            accessorKey: "model_name",
            width: 300,
            cell: (config: ILLMConfig) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-600 shrink-0">
                        <Server className="w-4 h-4" />
                    </div>
                    <span className="font-medium truncate">{config.model_name}</span>
                </div>
            )
        },
        {
            header: "Provider",
            width: 150,
            cell: (config: ILLMConfig) => (
                <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20">
                    {config.provider}
                </Badge>
            )
        },
        {
            header: "API Key",
            width: 200,
            cell: (config: ILLMConfig) => (
                <div className="flex items-center gap-1.5 text-muted-foreground font-mono text-xs">
                    <Key className="w-3.5 h-3.5 opacity-60" />
                    <span>{config.api_key ? `${config.api_key.substring(0, 8)}***` : 'N/A'}</span>
                </div>
            )
        },
        {
            header: "Created",
            width: 180,
            cell: (config: ILLMConfig) => (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 opacity-60" />
                    <span className="whitespace-nowrap">
                        {config.created_at ? new Date(config.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                </div>
            )
        },
        {
            header: "Actions",
            width: 80,
            align: 'center' as const,
            cell: (config: ILLMConfig) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost-premium" size="icon" className="h-7 w-7">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem asChild>
                                <Link href={`/llmconfigs/${config._id}/edit`} className="cursor-pointer">
                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onSelect={() => setDeleteId(config._id)}
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
        return <LoadingState fullPage message="Loading LLM configurations..." size="lg" />;
    }

    if (!hasPermission('read', 'llm_config', 'self')) {
        return <UnauthorizedState resource="LLM configurations" permission="read" />;
    }

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await llmConfigService.delete(deleteId);
            toast.success("LLM configuration deleted successfully");
            void queryClient.invalidateQueries({ queryKey: ['llmconfigs'] });
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to delete LLM configuration"));
        } finally {
            setDeleteId(null);
        }
    };

    return (
        <DashboardTabLayout
            title="LLM Configurations"
            icon={Server}
            description="Manage your AI model configurations and API keys"
            search={{
                value: search,
                onChange: setSearch,
                placeholder: "Search configurations..."
            }}
            refresh={{
                onRefresh: () => { void refetch(); },
                isRefreshing: isFetching
            }}
            create={{
                label: "Add Configuration",
                href: "/llmconfigs/create",
                permission: "create:llm_config:self"
            }}
            pagination={{
                currentPage: page,
                totalPages: response?.pagination.totalPages || 1,
                onPageChange: setPage,
                isLoading: loading || isFetching,
                totalItems: response?.pagination.total || 0,
            }}
        >
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
            ) : configs.length === 0 ? (
                <EmptyState
                    icon={Server}
                    title="No LLM Configurations Found"
                    description={search ? "No configurations match your search criteria." : "Add LLM configurations to connect your chatbots with AI models."}
                    action={{
                        label: "Add Configuration",
                        onClick: () => router.push('/llmconfigs/create'),
                        permission: "create:llm_config:self"
                    }}
                />
            ) : viewMode === 'table' ? (
                <ResourceTable<ILLMConfig>
                    data={configs}
                    columns={columns}
                    onRowClick={(config) => router.push(`/llmconfigs/${config._id}/edit`)}
                />
            ) : (
                <ResourceGrid count={configs.length}>
                    {configs.map(config => {
                        const actions: ActionItem[] = [
                            {
                                label: "Edit",
                                icon: Pencil,
                                onClick: () => router.push(`/llmconfigs/${config._id}/edit`),
                            },
                            {
                                label: "Delete",
                                icon: Trash2,
                                onClick: () => setDeleteId(config._id),
                                variant: "destructive",
                            }
                        ];

                        return (
                            <ResourceCard
                                key={config._id}
                                title={config.model_name}
                                icon={Server}
                                iconClassName="bg-blue-500/10 text-blue-600"
                                accentColor="info"
                                status={{
                                    label: config.provider,
                                    variant: 'secondary',
                                    className: 'bg-purple-500/10 text-purple-600 border-purple-500/20'
                                }}
                                metaItems={[
                                    { icon: Key, label: config.api_key ? `${config.api_key.substring(0, 8)}***` : 'N/A' },
                                    { icon: Clock, label: config.created_at ? new Date(config.created_at).toLocaleDateString() : 'N/A' }
                                ]}
                                onClick={() => router.push(`/llmconfigs/${config._id}/edit`)}
                                footer={
                                    <span className="opacity-70 whitespace-nowrap">
                                        {config.updated_at ? new Date(config.updated_at).toLocaleDateString() : 'N/A'}
                                    </span>
                                }
                                actions={actions}
                            />
                        );
                    })}
                </ResourceGrid>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Are you absolutely sure?"
                description="This will permanently delete the LLM configuration. This action cannot be undone."
                confirmText="Delete Configuration"
                variant="destructive"
                onConfirm={() => { void confirmDelete(); }}
            />

        </DashboardTabLayout>
    );
}
