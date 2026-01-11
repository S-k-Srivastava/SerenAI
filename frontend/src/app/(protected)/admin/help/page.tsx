"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { helpService } from "@/lib/api/services/helpService";
import { IHelp } from "@/types/help";
import { DashboardTabLayout } from "@/components/layout/DashboardTabLayout";
import { HelpCircle, MessageCircle, MoreVertical, Eye, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

import { useAuth } from "@/context/AuthContext";
import { UnauthorizedState } from "@/components/common/UnauthorizedState";
import { LoadingState } from "@/components/common/LoadingState";
import { useSearchFilter } from "@/hooks/useSearchFilter";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errorUtils";

export default function AdminHelpPage() {
    const { hasPermission, loading: authLoading } = useAuth();
    const [page, setPage] = useState(1);
    const { searchTerm: search, debouncedSearch, setSearchTerm: setSearch } = useSearchFilter();
    const [statusFilter] = useState("all");
    const [selectedTicket, setSelectedTicket] = useState<IHelp | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const { viewMode } = useViewMode();

    const { data: response, isLoading, isFetching, refetch, isError, error } = useQuery({
        queryKey: ["admin-help", page, search, statusFilter, debouncedSearch],
        queryFn: () => helpService.getAllAdmin({ 
            page, 
            limit: 10,
            status: statusFilter === 'all' ? undefined : statusFilter,
            search: debouncedSearch
        }),
        enabled: !authLoading && hasPermission('read', 'help', 'all'),
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

    if (authLoading) {
        return <LoadingState fullPage message="Loading help tickets..." size="lg" />;
    }

    if (!hasPermission('read', 'help', 'all')) {
        return <UnauthorizedState resource="Help Management" permission="read" />;
    }

    // Helper to get user display
    const getUserDisplay = (user: string | { email: string, firstName?: string, lastName?: string } | undefined) => {
        if (!user) return "Unknown";
        // The instruction's snippet for this part was syntactically incorrect.
        // Assuming the intent was to add a permission check for displaying user info,
        // but without a clear instruction on how to handle denied permission within this helper,
        // and to avoid breaking existing logic, I'm leaving this helper as is for now.
        // If a permission check is needed here, it would require a clear definition of its behavior.
        if (typeof user === 'string') return user;
        return user.email;
    };

    const columns = [
        {
            header: "User",
            accessorKey: "user_id",
            width: 200,
            cell: (ticket: IHelp) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        <User className="w-4 h-4" />
                    </div>
                    <span className="font-medium truncate">{getUserDisplay(ticket.user_id)}</span>
                </div>
            ),
        },
        {
            header: "Subject",
            accessorKey: "subject",
            cell: (ticket: IHelp) => (
                <div className="font-medium truncate max-w-[250px]">{ticket.subject}</div>
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
                                <span>View & Reply</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            ),
        },
    ];

    return (
        <DashboardTabLayout
            title="Help Management"
            icon={HelpCircle}
            description="Manage and reply to user support tickets."
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
            // No create button for admin here
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
                    description={search ? "No tickets match your search criteria." : "There are currently no support tickets."}
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
                                label: "View & Reply",
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
                                subtitle1={getUserDisplay(ticket.user_id)}
                                metaItems={[
                                    { icon: Mail, label: getUserDisplay(ticket.user_id), title: "User" },
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

            <HelpDetailDialog
                open={isDetailOpen}
                onOpenChange={(open) => {
                    setIsDetailOpen(open);
                    if (!open) setSelectedTicket(null);
                }}
                ticketId={selectedTicket?._id || null}
                isAdmin={true}
                canReply={true}
                onSuccess={() => { void refetch(); }}
            />
        </DashboardTabLayout>
    );
}
