'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchFilter } from '@/hooks/useSearchFilter';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, MessageCircleMore, Pencil, Trash2, Loader2, MoreVertical } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { UnauthorizedState } from '@/components/common/UnauthorizedState';
import { ResourceCard, ActionItem } from '@/components/common/ResourceCard';
import { ResourceGrid } from '@/components/common/ResourceGrid';
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
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingState } from '@/components/common/LoadingState';
import { chatService } from '@/lib/api/services/chatService';
import { IConversationListItem, ChatsResponse } from '@/types/chat';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';

const renameSchema = z.object({
    title: z.string().min(1, "Title is required").max(100, "Title is too long"),
});

export default function ChatsPage() {
    const router = useRouter();
    const { hasPermission, loading: authLoading } = useAuth();
    const { searchTerm: search, debouncedSearch, setSearchTerm: setSearch } = useSearchFilter();
    const [page, setPage] = useState(1);
    const [editingChat, setEditingChat] = useState<{ id: string, title: string } | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const limit = 12;
    const { viewMode } = useViewMode();

    const renameForm = useForm<{ title: string }>({
        resolver: zodResolver(renameSchema),
        defaultValues: { title: '' },
    });

    useEffect(() => {
        if (editingChat) {
            renameForm.reset({ title: editingChat.title });
        }
    }, [editingChat, renameForm]);

    // Table Columns Definition
    const columns = [
        {
            header: "Conversation",
            accessorKey: "title",
            width: 300,
            cell: (chat: IConversationListItem) => (
                <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-primary/10 text-primary shrink-0">
                        <MessageSquare className="w-4 h-4" />
                    </div>
                    <span className="font-medium truncate">{chat.title || chat.chatbot?.name || 'New Conversation'}</span>
                </div>
            )
        },
        {
            header: "Chatbot",
            width: 180,
            cell: (chat: IConversationListItem) => (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <MessageCircleMore className="w-3.5 h-3.5 opacity-60" />
                    <span className="truncate">{chat.chatbot?.name || 'Deleted Chatbot'}</span>
                </div>
            )
        },
        {
            header: "Messages",
            width: 100,
            cell: (chat: IConversationListItem) => {
                const messageCount = chat.messages ? chat.messages.length : 0;
                return (
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MessageSquare className="w-3.5 h-3.5 opacity-60" />
                        <span>{messageCount}</span>
                    </div>
                );
            }
        },
        {
            header: "Last Active",
            width: 180,
            cell: (chat: IConversationListItem) => (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Clock className="w-3.5 h-3.5 opacity-60" />
                    <span className="whitespace-nowrap">
                        {chat.last_message_at
                            ? formatDistanceToNow(new Date(chat.last_message_at), { addSuffix: true })
                            : 'Just now'}
                    </span>
                </div>
            )
        },
        {
            header: "Actions",
            width: 80,
            align: 'center' as const,
            cell: (chat: IConversationListItem) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem asChild>
                                <Link href={`/chat/${chat._id}`} className="cursor-pointer">
                                    <MessageSquare className="mr-2 h-4 w-4" /> Resume
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onSelect={() => {
                                    setEditingChat({ id: chat._id, title: chat.title || chat.chatbot?.name || 'New Conversation' });
                                }}
                            >
                                <Pencil className="mr-2 h-4 w-4" /> Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive cursor-pointer"
                                onSelect={() => setDeleteId(chat._id)}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    const onRenameSubmit = async (data: { title: string }) => {
        if (!editingChat) return;
        
        try {
            await chatService.updateTitle(editingChat.id, { title: data.title });
            await refetch();
            toast.success("Chat renamed successfully");
            setEditingChat(null);
        } catch {
            toast.error("Failed to rename chat");
        }
    };

    const handleDeleteChat = async () => {
        if (!deleteId) return;
        try {
            await chatService.delete(deleteId);
            await refetch();
            toast.success("Conversation deleted");
            setDeleteId(null);
        } catch {
            toast.error("Failed to delete conversation");
        }
    };

    // Use TanStack Query for caching
    const { data, isLoading: loading, isFetching, refetch, isError, error } = useQuery<ChatsResponse>({
        queryKey: ['conversations', debouncedSearch, page],
        queryFn: async () => {
             return await chatService.getAll({
                 search: debouncedSearch,
                 page,
                 limit
             });
        },
        enabled: !authLoading && hasPermission('read', 'chat', 'self'),
        staleTime: 1000 * 60 * 5, // Cache for 5 minutes
        gcTime: 1000 * 60 * 10, // Keep in cache for 10 minutes
    });

    useEffect(() => {
        if (isError) {
             toast.error(error?.message || "Failed to load conversations");
        }
    }, [isError, error]);

    // Auth loading state
    if (authLoading) {
        return <LoadingState fullPage message="Loading conversations..." size="lg" />;
    }

    if (!hasPermission('read', 'chat', 'self')) {
        return <UnauthorizedState resource="chat" permission="read" />;
    }

    const conversations = data?.data || [];
    const totalCount = data?.pagination.total || 0;
    const totalPages = data?.pagination.totalPages || 0;

    return (
        <>
            <DashboardTabLayout
                title="Conversations"
                icon={MessageSquare}
                description="Resume past chats or start new conversations"
                search={{
                    value: search,
                    onChange: (e) => { 
                        setSearch(e); 
                        setPage(1); 
                    },
                    placeholder: "Search conversations..."
                }}
                refresh={{
                    onRefresh: () => { void refetch(); },
                    isRefreshing: isFetching
                }}
                create={{
                    label: "New Chat",
                    onClick: () => router.push('/chatbots'),
                    permission: "create:chat:self"
                }}
                pagination={
                    !loading && totalPages > 0 ? {
                        currentPage: page,
                        totalPages: totalPages,
                        onPageChange: setPage,
                        isLoading: isFetching,
                        totalItems: totalCount,
                    } : undefined
                }
            >
                {loading ? (
                    <ResourceGrid count={8}>
                        {[...Array(8)].map((_, i) => (
                            <Card key={i} className="flex flex-row items-center p-3 sm:p-4 border-muted/30 animate-pulse bg-card/40 backdrop-blur-md">
                                <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg sm:rounded-xl mr-3" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/2" />
                                    <Skeleton className="h-3 w-1/3" />
                                </div>
                            </Card>
                        ))}
                    </ResourceGrid>
                ) : conversations.length === 0 ? (
                    <EmptyState
                        icon={MessageSquare}
                        title="No Conversations Yet"
                        description={search ? "No chats match your search criteria." : "Start your first conversation with an AI chatbot."}
                        action={{
                            label: "Start New Chat",
                            onClick: () => router.push('/chatbots'),
                            permission: "create:chat:self"
                        }}
                    />
                ) : viewMode === 'table' ? (
                    <ResourceTable<IConversationListItem>
                        data={conversations}
                        columns={columns}
                        onRowClick={(chat) => router.push(`/chat/${chat._id}`)}
                    />
                ) : (
                    <ResourceGrid count={conversations.length}>
                        {conversations.map(chat => {
                            const messageCount = chat.messages ? chat.messages.length : 0;
                            const actions: ActionItem[] = [
                                {
                                    label: "Open Chat",
                                    icon: MessageSquare,
                                    onClick: () => router.push(`/chat/${chat._id}`),
                                },
                                {
                                    label: "Rename",
                                    icon: Pencil,
                                    onClick: () => setEditingChat({ id: chat._id, title: chat.title || chat.chatbot?.name || 'New Conversation' }),
                                },
                                {
                                    label: "Delete",
                                    icon: Trash2,
                                    onClick: () => setDeleteId(chat._id),
                                    variant: "destructive",
                                }
                            ];

                            return (
                                <ResourceCard
                                    key={chat._id}
                                    title={chat.title || chat.chatbot?.name || 'New Conversation'}
                                    icon={MessageSquare}
                                    accentColor="primary"
                                    subtitle1={chat.chatbot?.name || 'Deleted Chatbot'}
                                    metaItems={[
                                        {
                                            icon: MessageSquare,
                                            label: `${messageCount} msgs`
                                        },
                                        {
                                            icon: Clock,
                                            label: chat.last_message_at
                                                ? formatDistanceToNow(new Date(chat.last_message_at))
                                                : 'Just now',
                                        }
                                    ]}
                                    onClick={() => router.push(`/chat/${chat._id}`)}
                                    actions={actions}
                                />
                            );
                        })}
                    </ResourceGrid>
                )}
            </DashboardTabLayout>

            {/* Rename Dialog */}
            <div className={cn("fixed inset-0 z-50 bg-background/80 backdrop-blur-sm", editingChat ? "block" : "hidden")}>
                <div className={cn(
                    "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg md:w-full",
                    editingChat ? "animate-in fade-in-0 zoom-in-95" : "animate-out fade-out-0 zoom-out-95 hidden"
                )}>
                    <div className="flex flex-col space-y-1.5 text-center sm:text-left">
                        <h2 className="text-lg font-semibold leading-none tracking-tight">Rename Chat</h2>
                        <p className="text-sm text-muted-foreground">Enter a new title for this conversation.</p>
                    </div>
                    <Form {...renameForm}>
                        <form onSubmit={(e) => { void renameForm.handleSubmit(onRenameSubmit)(e); }}>
                            <div className="grid gap-4 py-4">
                                <FormField
                                    control={renameForm.control}
                                    name="title"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    className="col-span-3"
                                                    autoFocus
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setEditingChat(null)}>Cancel</Button>
                                <Button type="submit" disabled={renameForm.formState.isSubmitting}>
                                    {renameForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Delete Conversation"
                description="Are you sure you want to delete this conversation? This action cannot be undone."
                confirmText="Delete"
                variant="destructive"
                onConfirm={() => { void handleDeleteChat(); }}
            />
        </>
    );
}
