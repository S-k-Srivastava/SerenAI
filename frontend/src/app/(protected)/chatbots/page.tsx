'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Bot, MessageCircle, RefreshCw, Pencil, Share2, FileText, MoreVertical } from 'lucide-react';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { IChatbot } from "@/types/chatbot";
import { getErrorMessage } from "@/lib/errorUtils";
import { useViewMode } from "@/context/ViewModeContext";
import { ResourceTable } from "@/components/common/ResourceTable";
import { ResourceGrid } from "@/components/common/ResourceGrid";
import { ResourceCard, type ActionItem } from "@/components/common/ResourceCard";
import { chatbotService } from "@/lib/api/services/chatbotService";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DashboardTabLayout } from '@/components/layout/DashboardTabLayout';
import { ShareChatbotDialog } from '@/components/common/ShareChatbotDialog';
import { UnauthorizedState } from '@/components/common/UnauthorizedState';
import { EmptyState } from '@/components/common/EmptyState';
import { StatusBadge } from '@/components/common/StatusBadge';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { LoadingState } from '@/components/common/LoadingState';
import { useAuth } from '@/context/AuthContext';
import { useSearchFilter } from '@/hooks/useSearchFilter';

export default function ChatBotsPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { hasPermission, loading: authLoading } = useAuth();
    const { searchTerm: search, debouncedSearch, setSearchTerm: setSearch } = useSearchFilter();
    const [page, setPage] = useState(1);
    const limit = 12;

    const { data: chatbotsData, isLoading: loading, isFetching, refetch, isError, error } = useQuery({
        queryKey: ['chatbots', debouncedSearch, page],
        queryFn: async () => {
            return await chatbotService.getAll({
                page,
                limit,
                search: debouncedSearch
            });
        },
        enabled: !authLoading && hasPermission('read', 'chatbot', 'self'),
        staleTime: 1000 * 60 * 3,
        gcTime: 1000 * 60 * 15,
    });

    useEffect(() => {
        if (isError) {
            toast.error(error?.message || "Failed to fetch chatbots");
        }
    }, [isError, error]);

    // Standard IPaginatedResult structure from backend
    const chatbots = chatbotsData?.data || [];
    const pagination = chatbotsData?.pagination;
    const totalItems = pagination?.total || 0;
    const totalPages = pagination?.totalPages || 0;

    // Reset page when search changes
    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [shareBot, setShareBot] = useState<{ id: string; name: string } | null>(null);
    const [startingChatId, setStartingChatId] = useState<string | null>(null);

    const { viewMode } = useViewMode();

    const handleCreateWrapper = () => {
        router.push('/chatbots/create');
    };

    const handleStartChat = async (botId: string) => {
        if (startingChatId) return;
        setStartingChatId(botId);
        try {
            const result = await chatbotService.startChat(botId);
            void queryClient.invalidateQueries({ queryKey: ['recent-chats'] });
            router.push(`/chat/${result.conversationId}`);
        } catch (error) {
            console.error("Failed to start conversation", error);
            toast.error("Failed to start conversation");
            setStartingChatId(null);
        }
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        try {
            await chatbotService.delete(deleteId);
            toast.success("Chatbot deleted successfully");
            const newTotal = totalItems - 1;
            const newTotalPages = Math.ceil(newTotal / limit);
            if (page > newTotalPages && page > 1) {
                setPage(page - 1);
            }
            void queryClient.invalidateQueries({ queryKey: ['chatbots'] });
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to delete chatbot"));
        } finally {
            setDeleteId(null);
        }
    };

    /**
     * Generate actions for each chatbot based on ownership and permissions
     */
    const getActionsForBot = (bot: IChatbot): ActionItem[] => {
        if (!bot.is_owner) {
            return [
                {
                    label: 'Chat',
                    icon: MessageCircle,
                    onClick: () => { void handleStartChat(bot._id); },
                }
            ];
        }

        return [
            {
                label: 'Chat',
                icon: MessageCircle,
                onClick: () => { void handleStartChat(bot._id); },
            },
            {
                label: 'Edit',
                icon: Pencil,
                onClick: () => router.push(`/chatbots/${bot._id}/edit`),
            },
            ...(bot.visibility === 'SHARED' || bot.visibility === 'PUBLIC' ? [{
                label: bot.visibility === 'PUBLIC' ? 'Copy Public Link' : 'Share',
                icon: Share2,
                onClick: () => {
                    if (bot.visibility === 'PUBLIC') {
                        const publicUrl = `${window.location.origin}/public-chat/${bot._id}`;
                        void navigator.clipboard.writeText(publicUrl);
                        toast.success('Public link copied to clipboard!');
                    } else {
                        setShareBot({ id: bot._id, name: bot.name });
                    }
                },
            }] : []),
            {
                label: 'Delete',
                icon: Trash2,
                onClick: () => setDeleteId(bot._id),
                variant: 'destructive' as const,
            },
        ];
    };

    if (authLoading) return <LoadingState />;

    if (!hasPermission('read', 'chatbot', 'self')) {
        return <UnauthorizedState resource="Chatbots" />;
    }

    const columns = [
        {
            header: "Name",
            accessorKey: "name",
            cell: (bot: IChatbot) => (
                <div className="flex items-center gap-2">
                    <div className={cn(
                        "p-1.5 rounded-md shrink-0",
                        (bot.is_active) ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                        <Bot className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-medium text-foreground">{bot.name}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1">{bot.system_prompt || 'No description'}</span>
                    </div>
                </div>
            )
        },
        {
            header: "Status",
            accessorKey: "is_active",
            cell: (bot: IChatbot) => (
                <div className="flex items-center gap-2">
                    <StatusBadge
                        status={(bot.is_active) ? 'active' : 'inactive'}
                        type="chatbot"
                    />
                    {!bot.is_owner && (
                        <Badge variant="secondary" className="text-xs">Shared</Badge>
                    )}
                </div>
            )
        },
        {
            header: "Knowledge",
            cell: (bot: IChatbot) => (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="w-3.5 h-3.5 opacity-60" />
                    <span>{bot.documents?.length || 0}</span>
                </div>
            )
        },
        {
            header: "Actions",
            align: 'center' as const,
            cell: (bot: IChatbot) => (
                <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                        <PermissionGuard permission="create:chat:self">
                            <Button
                                variant="ghost-premium"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => { void handleStartChat(bot._id); }}
                                disabled={startingChatId === bot._id}
                            >
                                {startingChatId === bot._id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
                            </Button>
                        </PermissionGuard>
                        {bot.is_owner && (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost-premium" className="h-8 w-8 p-0">
                                        <span className="sr-only">Open menu</span>
                                        <MoreVertical className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        void handleStartChat(bot._id);
                                    }}>
                                        <MessageCircle className="mr-2 h-4 w-4" />
                                        Chat
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => {
                                        e.stopPropagation();
                                        router.push(`/chatbots/${bot._id}/edit`);
                                    }}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        Edit
                                    </DropdownMenuItem>
                                    {(bot.visibility === 'SHARED' || bot.visibility === 'PUBLIC') && (
                                        <DropdownMenuItem onClick={(e) => {
                                            e.stopPropagation();
                                            if (bot.visibility === 'PUBLIC') {
                                                const publicUrl = `${window.location.origin}/public-chat/${bot._id}`;
                                                void navigator.clipboard.writeText(publicUrl);
                                                toast.success('Public link copied to clipboard!');
                                            } else {
                                                setShareBot({ id: bot._id, name: bot.name });
                                            }
                                        }}>
                                            <Share2 className="mr-2 h-4 w-4" />
                                            {bot.visibility === 'PUBLIC' ? 'Copy Public Link' : 'Share'}
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteId(bot._id);
                                        }}
                                        className="text-destructive focus:text-destructive"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        )}
                    </div>
                </div>
            )
        }
    ];

    return (
        <DashboardTabLayout
            title="Chatbots"
            icon={Bot}
            description="Manage your AI assistants"
            refresh={{
                onRefresh: () => { void refetch(); },
                isRefreshing: isFetching
            }}
            create={{
                label: "Create Chatbot",
                onClick: handleCreateWrapper,
                permission: "create:chatbot:self"
            }}
            search={{
                value: search,
                onChange: setSearch,
                placeholder: "Search chatbots..."
            }}
            pagination={{
                currentPage: page,
                totalPages: totalPages,
                onPageChange: setPage,
                totalItems: totalItems
            }}
        >
            {loading ? (
                <ResourceGrid count={6}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="flex flex-col bg-card border-border/60 h-full animate-pulse">
                            <div className="p-4 flex gap-3.5">
                                <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
                                <div className="flex-1 space-y-2 py-1">
                                    <Skeleton className="h-5 w-3/4" />
                                    <Skeleton className="h-4 w-1/2" />
                                </div>
                            </div>
                            <div className="mt-auto border-t border-border/40 bg-muted/5 px-4 py-2 flex items-center justify-between gap-4">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-5 w-12 rounded-full" />
                            </div>
                        </Card>
                    ))}
                </ResourceGrid>
            ) : chatbots.length === 0 ? (
                <EmptyState
                    icon={Bot}
                    title="No chatbots found"
                    description={search ? "Try adjusting your search terms" : "Get started by creating your first chatbot"}
                    action={
                        !search ? {
                            label: "Create Chatbot",
                            onClick: handleCreateWrapper,
                            permission: "create:chatbot:self",
                            variant: "gradient"
                        } : undefined
                    }
                />
            ) : viewMode === 'table' ? (
                <ResourceTable
                    data={chatbots}
                    columns={columns}
                    onRowClick={(bot) => router.push(`/chatbots/${bot._id}`)}
                />
            ) : (
                <ResourceGrid count={chatbots.length}>
                    {chatbots.map((bot: IChatbot) => (
                        <ResourceCard
                            key={bot._id}
                            title={bot.name}
                            subtitle1={bot.system_prompt || 'No description'}
                            icon={Bot}
                            accentColor={(bot.is_active) ? 'primary' : 'warning'}
                            status={{
                                label: (bot.is_active) ? 'Active' : 'Inactive',
                                variant: (bot.is_active) ? 'success' : 'secondary'
                            }}
                            suffix={!bot.is_owner ? <Badge variant="secondary" className="text-xs">Shared</Badge> : undefined}
                            onClick={() => router.push(`/chatbots/${bot._id}`)}
                            metaItems={[
                                {
                                    icon: FileText,
                                    label: `${bot.documents?.length || 0} docs`,
                                    title: "Number of knowledge base documents"
                                },
                            ]}
                            actions={getActionsForBot(bot)}
                        />
                    ))}
                </ResourceGrid>
            )}

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Delete Chatbot"
                description="Are you sure you want to delete this chatbot? This action cannot be undone."
                confirmText="Delete"
                variant="destructive"
                onConfirm={() => { void confirmDelete(); }}
            />

            {shareBot && (
                <ShareChatbotDialog
                    open={!!shareBot}
                    onOpenChange={(open) => !open && setShareBot(null)}
                    chatbotId={shareBot.id}
                    chatbotName={shareBot.name}
                />
            )}
        </DashboardTabLayout>
    );
}
