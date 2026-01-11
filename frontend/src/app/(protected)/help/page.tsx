"use client";

import { useQuery } from "@tanstack/react-query";
import { helpService } from "@/lib/api/services/helpService";
import { IHelp } from "@/types/help";
import React, { useState, useEffect, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorUtils";
import { DashboardTabLayout } from "@/components/layout/DashboardTabLayout";
import { HelpCircle, MessageCircle, MoreVertical, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpFormDialog } from "@/components/help/HelpFormDialog";
import { HelpDetailDialog } from "@/components/help/HelpDetailDialog";
import { ResourceTable } from "@/components/common/ResourceTable";
import { ResourceGrid } from "@/components/common/ResourceGrid";
import { ResourceCard, ActionItem } from "@/components/common/ResourceCard";
import { Card } from "@/components/ui/card";
import { useViewMode } from "@/context/ViewModeContext";
import { formatDistanceToNow } from "date-fns";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/common/EmptyState";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";

function HelpPageContent() {
    const { hasPermission, loading: authLoading } = useAuth();
    const [page, setPage] = useState(1);
    const [statusFilter] = useState("all");
    const { searchTerm: search, debouncedSearch, setSearchTerm: setSearch } = useSearchFilter();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<IHelp | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const { viewMode } = useViewMode();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get("create") === "true") {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsCreateOpen(true);
        }
    }, [searchParams]);

    const { data: response, isLoading, isFetching, refetch, isError, error } = useQuery({
        queryKey: ["help", page, statusFilter, debouncedSearch],
        queryFn: () => helpService.getAll({ 
            page, 
            limit: 10,
            status: statusFilter === 'all' ? undefined : statusFilter,
            search: debouncedSearch
        }),
        enabled: !authLoading && hasPermission('read', 'help', 'self'),
    });

    useEffect(() => {
        if (isError) {
            toast.error(getErrorMessage(error, "Failed to load help tickets"));
        }
    }, [isError, error]);

    const tickets = response?.data || [];
    const pagination = response?.pagination;
    const totalCount = pagination?.total || 0;
    const totalPages = pagination?.totalPages || 0;

    const columns = [
        {
            header: "Subject",
            accessorKey: "subject",
            cell: (ticket: IHelp) => (
                <div className="font-medium truncate max-w-[300px]">{ticket.subject}</div>
            ),
        },
        {
            header: "Status",
            accessorKey: "status",
            width: 120,
            cell: (ticket: IHelp) => (
                <Badge
                    variant={ticket.status === "resolved" ? "success" : "secondary"}
                    className="capitalize"
                >
                    {ticket.status}
                </Badge>
            ),
        },
        {
            header: "Last Update",
            accessorKey: "updatedAt",
            width: 150,
            cell: (ticket: IHelp) => (
                <span className="text-muted-foreground text-sm">
                    {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                </span>
            ),
        },
        {
            header: "Replies",
            width: 100,
            cell: (ticket: IHelp) => (
                <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageCircle className="w-3 h-3" />
                    <span>{ticket.messages.length}</span>
                </div>
            ),
        },
        {
            header: "Actions",
            width: 80,
            align: "center" as const,
            cell: (ticket: IHelp) => (
                <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost-premium" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => {
                                    setSelectedTicket(ticket);
                                    setIsDetailOpen(true);
                                }}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                <span>View Details</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

    return (
        <DashboardTabLayout
            title="Help Center"
            icon={HelpCircle}
            description="Get help with your AI assistants and account."
            search={{
                value: search,
                onChange: (val) => {
                    setSearch(val);
                    setPage(1);
                },
                placeholder: "Search tickets by subject..."
            }}
            refresh={{
                onRefresh: () => { void refetch(); },
                isRefreshing: isFetching
            }}
            create={{
                label: "New Ticket",
                onClick: () => setIsCreateOpen(true),
                permission: "create:help:self" // Assuming user has this
            }}
            pagination={
                !isLoading && totalPages > 0 ? {
                    currentPage: page,
                    totalPages: totalPages,
                    onPageChange: setPage,
                    isLoading: isFetching,
                    totalItems: totalCount,
                } : undefined
            }
        >
            {isLoading ? (
                <ResourceGrid count={8}>
                    {Array.from({ length: 8 }).map((_, i) => (
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
            ) : tickets.length === 0 ? (
                <EmptyState
                    icon={HelpCircle}
                    title="No Tickets Found"
                    description="Need assistance? Create a support ticket and we'll get back to you."
                    action={{
                        label: "New Ticket",
                        onClick: () => setIsCreateOpen(true),
                        permission: "create:help:self"
                    }}
                />
            ) : viewMode === 'table' ? (
                <ResourceTable<IHelp>
                    data={tickets}
                    columns={columns}
                    onRowClick={(ticket) => {
                        setSelectedTicket(ticket);
                        setIsDetailOpen(true);
                    }}
                />
            ) : (
                <ResourceGrid count={tickets.length}>
                    {tickets.map((ticket) => {
                        const actions: ActionItem[] = [
                            {
                                label: "View Details",
                                icon: Eye,
                                onClick: () => {
                                    setSelectedTicket(ticket);
                                    setIsDetailOpen(true);
                                },
                            }
                        ];

                        return (
                            <ResourceCard
                                key={ticket._id}
                                title={ticket.subject}
                                icon={HelpCircle}
                                iconClassName="bg-primary/10 text-primary"
                                accentColor={ticket.status === 'resolved' ? 'success' : 'info'}
                                status={{
                                    label: ticket.status,
                                    variant: ticket.status === 'resolved' ? 'success' : 'secondary',
                                    className: "capitalize"
                                }}
                                subtitle1={formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
                                metaItems={[
                                    { icon: MessageCircle, label: `${ticket.messages.length} replies`, title: "Replies" }
                                ]}
                                onClick={() => {
                                    setSelectedTicket(ticket);
                                    setIsDetailOpen(true);
                                }}
                                actions={actions}
                            >
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                                    {ticket.body}
                                </p>
                            </ResourceCard>
                        );
                    })}
                </ResourceGrid>
            )}

            <HelpFormDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                onSuccess={() => { void refetch(); }}
                initialValues={{
                    subject: searchParams.get("subject") || undefined,
                    body: searchParams.get("body") || undefined
                }}
            />

            <HelpDetailDialog
                open={isDetailOpen}
                onOpenChange={(open) => {
                    setIsDetailOpen(open);
                    if (!open) setSelectedTicket(null);
                }}
                ticketId={selectedTicket?._id || null}
                canReply={true} // Users can reply to their own tickets by adding messages
                onSuccess={() => { void refetch(); }}
            />
        </DashboardTabLayout>
    );
}

export default function HelpPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading Help Center...</div>}>
            <HelpPageContent />
        </Suspense>
    );
}
