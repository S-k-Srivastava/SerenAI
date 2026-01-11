"use client"

import React, { useState } from "react"
import { DashboardTabLayout } from "@/components/layout/DashboardTabLayout"
import { Button } from "@/components/ui/button"
import { MoreVertical, Mail, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { MultiSelectFilter } from "@/components/common/MultiSelectFilter"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { LoadingState } from "@/components/common/LoadingState"
import { UnauthorizedState } from "@/components/common/UnauthorizedState"
import { useDebounce } from "@/hooks/useDebounce"
import { IContactUs, ContactUsStatus } from "@/types/api"
import { getErrorMessage } from "@/lib/errorUtils"
import { useViewMode } from "@/context/ViewModeContext"
import { ResourceTable } from "@/components/common/ResourceTable"
import { ResourceGrid } from "@/components/common/ResourceGrid"
import { ResourceCard, ActionItem } from "@/components/common/ResourceCard"
import { EmptyState } from "@/components/common/EmptyState"
import { contactUsService } from "@/lib/api/services/contactUsService"
import { format } from "date-fns"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export default function ContactUsPage() {
    const queryClient = useQueryClient();
    const [viewingSubmission, setViewingSubmission] = useState<IContactUs | null>(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const debouncedSearch = useDebounce(search, 500);

    const statusOptions = ["All Status", "Submitted", "Resolved"];

    const [page, setPage] = useState(1);
    const limit = 12;
    const { viewMode } = useViewMode();

    const { hasPermission, loading: authLoading } = useAuth();

    // Reset page when search or filter changes
    React.useEffect(() => {
        setPage(1);
    }, [debouncedSearch, statusFilter]);

    // Derive actual status from filter
    const actualStatus = React.useMemo(() => {
        if (statusFilter.length === 0 || statusFilter[0] === "All Status") {
            return "all";
        }
        return statusFilter[0].toLowerCase() as ContactUsStatus;
    }, [statusFilter]);

    const { data, isLoading, isFetching, refetch, isError, error } = useQuery({
        queryKey: ['contactus', page, debouncedSearch, actualStatus],
        queryFn: async () => {
            const params: { page: number; limit: number; search?: string; status?: ContactUsStatus } = {
                page,
                limit,
            };

            if (debouncedSearch) {
                params.search = debouncedSearch;
            }

            if (actualStatus !== "all") {
                params.status = actualStatus;
            }

            return await contactUsService.getAll(params);
        },
        enabled: !authLoading && hasPermission('read', 'contact_us', 'all'),
        staleTime: 1000 * 60 * 2, // 2 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
    });

    React.useEffect(() => {
        if (isError) {
            toast.error(error?.message || "Failed to fetch contact submissions");
        }
    }, [isError, error]);

    if (authLoading) {
        return <LoadingState fullPage message="Loading contact submissions..." size="lg" />;
    }

    if (!hasPermission('read', 'contact_us', 'all')) {
        return <UnauthorizedState resource="Contact Us Management" permission="read" />;
    }

    const submissions = data?.data || [];
    const pagination = data?.pagination;
    const totalItems = pagination?.total || 0;
    const totalPages = pagination?.totalPages || Math.ceil(totalItems / limit);

    const handleUpdateStatus = async (id: string, status: ContactUsStatus) => {
        try {
            await contactUsService.updateStatus(id, status);
            toast.success(`Status updated to ${status}`);
            void queryClient.invalidateQueries({ queryKey: ['contactus'] });
            setViewingSubmission(null);
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to update status"));
        }
    };

    const columns = [
        {
            header: "Subject",
            accessorKey: "subject",
            width: 250,
            cell: (submission: IContactUs) => (
                <div className="flex flex-col">
                    <span className="font-medium line-clamp-1">{submission.subject}</span>
                    <span className="text-xs text-muted-foreground">{submission.email}</span>
                </div>
            )
        },
        {
            header: "Message",
            accessorKey: "body",
            width: 350,
            cell: (submission: IContactUs) => (
                <span className="text-muted-foreground line-clamp-2">{submission.body}</span>
            )
        },
        {
            header: "Status",
            width: 120,
            cell: (submission: IContactUs) => (
                <Badge
                    variant={submission.status === 'resolved' ? 'default' : 'secondary'}
                    className={cn(
                        "capitalize px-2 py-0.5 text-[10px]",
                        submission.status === 'resolved' && "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900"
                    )}
                >
                    {submission.status}
                </Badge>
            )
        },
        {
            header: "Date",
            width: 150,
            cell: (submission: IContactUs) => (
                <span className="text-sm text-muted-foreground">
                    {format(new Date(submission.createdAt), "MMM dd, yyyy")}
                </span>
            )
        },
        {
            header: "Actions",
            width: 100,
            align: 'center' as const,
            cell: (submission: IContactUs) => (
                <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setViewingSubmission(submission)}>
                                <Mail className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            {submission.status === 'submitted' && (
                                <DropdownMenuItem
                                    onClick={() => { void handleUpdateStatus(submission._id, 'resolved'); }}
                                    className="text-green-600 focus:text-green-600"
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Mark Resolved
                                </DropdownMenuItem>
                            )}
                            {submission.status === 'resolved' && (
                                <DropdownMenuItem
                                    onClick={() => { void handleUpdateStatus(submission._id, 'submitted'); }}
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Mark Submitted
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        },
    ];

    const getCardActions = (submission: IContactUs): ActionItem[] => {
        const actions: ActionItem[] = [
            {
                label: "View Details",
                icon: Mail,
                onClick: () => setViewingSubmission(submission),
            },
        ];

        if (submission.status === 'submitted') {
            actions.push({
                label: "Mark Resolved",
                icon: CheckCircle2,
                onClick: () => { void handleUpdateStatus(submission._id, 'resolved'); },
                variant: "default" as const,
            });
        } else {
            actions.push({
                label: "Mark Submitted",
                icon: CheckCircle2,
                onClick: () => { void handleUpdateStatus(submission._id, 'submitted'); },
            });
        }

        return actions;
    };

    return (
        <DashboardTabLayout
            title="Contact Submissions"
            icon={Mail}
            description="Manage and respond to user inquiries"
            search={{
                value: search,
                onChange: setSearch,
                placeholder: "Search contact submissions...",
            }}
            refresh={{
                onRefresh: () => { void refetch(); },
                isRefreshing: isFetching && !isLoading,
            }}
            pagination={{
                currentPage: page,
                totalPages,
                onPageChange: setPage,
                isLoading: isLoading || isFetching,
                totalItems,
            }}
            showViewModeToggle
        >
            <div className="mb-4">
                <MultiSelectFilter
                    options={statusOptions}
                    selectedValues={statusFilter}
                    onSelectionChange={setStatusFilter}
                    placeholder="Filter by status..."
                    searchPlaceholder="Search status..."
                    emptyMessage="No status found."
                    multiSelect={false}
                />
            </div>

            {isLoading ? (
                <LoadingState message="Loading contact submissions..." />
            ) : submissions.length === 0 ? (
                <EmptyState
                    icon={Mail}
                    title="No Contact Submissions"
                    description={search || actualStatus !== "all"
                        ? "No submissions match your search or filter criteria."
                        : "No contact submissions received yet. Users can submit inquiries through the contact form."}
                />
            ) : viewMode === "table" ? (
                <ResourceTable
                    columns={columns}
                    data={submissions}
                    onRowClick={(submission) => setViewingSubmission(submission)}
                />
            ) : (
                <ResourceGrid count={submissions.length}>
                    {submissions.map((submission) => (
                        <ResourceCard
                            key={submission._id}
                            title={submission.subject}
                            subtitle1={submission.email}
                            icon={Mail}
                            status={{
                                label: submission.status,
                                variant: submission.status === 'resolved' ? 'success' : 'warning'
                            }}
                            metaItems={[
                                { icon: Mail, label: format(new Date(submission.createdAt), "MMM dd, yyyy") },
                            ]}
                            actions={getCardActions(submission)}
                            onClick={() => setViewingSubmission(submission)}
                            accentColor={submission.status === 'resolved' ? 'success' : 'info'}
                        />
                    ))}
                </ResourceGrid>
            )}

            {/* View Submission Dialog */}
            <Dialog open={!!viewingSubmission} onOpenChange={() => setViewingSubmission(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Contact Submission Details</DialogTitle>
                        <DialogDescription>
                            Submitted on {viewingSubmission && format(new Date(viewingSubmission.createdAt), "MMMM dd, yyyy 'at' h:mm a")}
                        </DialogDescription>
                    </DialogHeader>
                    {viewingSubmission && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Subject</label>
                                <p className="text-base font-medium mt-1">{viewingSubmission.subject}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Email</label>
                                <p className="text-base mt-1">{viewingSubmission.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Message</label>
                                <p className="text-base mt-1 whitespace-pre-wrap">{viewingSubmission.body}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground">Status</label>
                                <div className="mt-2">
                                    <Badge
                                        variant={viewingSubmission.status === 'resolved' ? 'default' : 'secondary'}
                                        className={cn(
                                            "capitalize",
                                            viewingSubmission.status === 'resolved' && "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900"
                                        )}
                                    >
                                        {viewingSubmission.status}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-4">
                                {viewingSubmission.status === 'submitted' ? (
                                    <Button
                                        onClick={() => { void handleUpdateStatus(viewingSubmission._id, 'resolved'); }}
                                        className="flex-1"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                        Mark as Resolved
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => { void handleUpdateStatus(viewingSubmission._id, 'submitted'); }}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        Mark as Submitted
                                    </Button>
                                )}
                                <Button variant="outline" onClick={() => setViewingSubmission(null)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </DashboardTabLayout>
    )
}
