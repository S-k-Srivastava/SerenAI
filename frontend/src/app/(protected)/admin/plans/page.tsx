"use client"

import React, { useState } from "react"
import { DashboardTabLayout } from "@/components/layout/DashboardTabLayout"
import { Button } from "@/components/ui/button"
import { MoreVertical, CreditCard, Tag, Layers, CheckCircle, Smartphone } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PlanFormDialog } from "@/components/admin/PlanFormDialog"
import { planService } from "@/lib/api/services/planService"
import { useQuery } from "@tanstack/react-query"
import { useDebounce } from "@/hooks/useDebounce"
import { useViewMode } from "@/context/ViewModeContext"
import { ResourceTable } from "@/components/common/ResourceTable"
import { ResourceGrid } from "@/components/common/ResourceGrid"
import { ResourceCard, ActionItem } from "@/components/common/ResourceCard"
import { Card } from "@/components/ui/card"
import { IPlan, PlansResponse } from "@/types/plan"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { LoadingState } from "@/components/common/LoadingState"
import { UnauthorizedState } from "@/components/common/UnauthorizedState"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { getErrorMessage } from "@/lib/errorUtils"

export default function PlansPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [editingPlan, setEditingPlan] = useState<IPlan | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const { viewMode } = useViewMode();

    const { hasPermission, loading: authLoading } = useAuth();

    // Reset page when search changes
    React.useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const { data, isLoading, isFetching, refetch, isError, error } = useQuery<PlansResponse>({
        queryKey: ['admin-plans', page, debouncedSearch],
        queryFn: async () => {
             const params: Record<string, string | number> = {
                 page,
                 limit: 12
             };

             if (debouncedSearch) {
                 params.search = debouncedSearch;
             }

             // planService.getAll returns { data: IPlan[], pagination: ... }
             return await planService.getAll(params);
        },
        enabled: !authLoading && hasPermission('read', 'plan', 'all'),
        staleTime: 1000 * 60 * 3, // 3 minutes
        gcTime: 1000 * 60 * 15, // 15 minutes
    });

    React.useEffect(() => {
        if (isError) {
             toast.error(error?.message || "Failed to fetch plans");
        }
    }, [isError, error]);

    if (authLoading) {
        return <LoadingState fullPage message="Loading plans..." size="lg" />;
    }

    if (!hasPermission('read', 'plan', 'all')) {
        return <UnauthorizedState resource="Plans Management" permission="read" />;
    }

    const plans = data?.data || [];
    const pagination = data?.pagination;

    const displayedPlans = plans;

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await planService.delete(deleteId);
            toast.success("Plan deleted successfully");
            setDeleteId(null);
            void refetch();
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to delete plan"));
        }
    }

    const columns = [
        {
            header: "Plan Name",
            accessorKey: "name",
            width: 200,
            cell: (plan: IPlan) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                        <div className="font-medium truncate">{plan.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">{plan.description}</div>
                    </div>
                </div>
            )
        },
        {
            header: "Price",
            accessorKey: "price",
            width: 120,
            cell: (plan: IPlan) => (
                <div className="font-medium">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(plan.price)}
                    {plan.discountPercentage > 0 && (
                        <Badge variant="outline" className="ml-2 text-[10px] text-green-600 border-green-200 bg-green-50">
                            {plan.discountPercentage}% OFF
                        </Badge>
                    )}
                </div>
            )
        },
        {
            header: "Limits",
            width: 200,
            cell: (plan: IPlan) => (
                <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Layers className="w-3 h-3" /> {plan.max_chatbot_count} Bots
                    </div>
                    <div className="flex items-center gap-1">
                        <Layers className="w-3 h-3" /> {plan.max_document_count} Docs
                    </div>
                    <div className="flex items-center gap-1">
                        <Smartphone className="w-3 h-3" /> {plan.max_chatbot_shares} Shares/Bot
                    </div>
                    {plan.benefits && plan.benefits.length > 0 && (
                        <div className="mt-1 text-[10px] text-primary/60 italic truncate">
                            {plan.benefits.length} benefits included
                        </div>
                    )}
                </div>
            )
        },
        {
            header: "Public Chatbots",
            width: 100,
            align: 'center' as const,
            cell: (plan: IPlan) => (
                <div className="flex justify-center">
                    {plan.is_public_chatbot_allowed ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                    )}
                </div>
            )
        },
        {
            header: "Actions",
            width: 100,
            align: 'center' as const,
            cell: (plan: IPlan) => (
                <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingPlan(plan)}>
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteId(plan._id)}>
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    return (
        <DashboardTabLayout
            title="Plans"
            icon={CreditCard}
            description="Manage subscription plans and usage limits."
            search={{
                value: search,
                onChange: setSearch,
                placeholder: "Search plans..."
            }}
            refresh={{
                onRefresh: () => { void refetch(); },
                isRefreshing: isFetching
            }}
            create={{
                label: "Create Plan",
                onClick: () => setIsCreateDialogOpen(true),
                permission: "create:plan:all"
            }}
            pagination={
                pagination && pagination.totalPages > 0 ? {
                    currentPage: pagination.page,
                    totalPages: pagination.totalPages,
                    onPageChange: setPage,
                    isLoading: isFetching,
                    totalItems: pagination.total,
                } : undefined
            }
        >
            {isLoading ? (
                <ResourceGrid count={6}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="flex flex-row items-center p-4 border-muted/30 aspect-[4/1] animate-pulse">
                            <div className="h-10 w-10 bg-muted rounded-full mr-3" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-1/2 bg-muted rounded" />
                                <div className="h-3 w-1/3 bg-muted rounded" />
                            </div>
                        </Card>
                    ))}
                </ResourceGrid>
            ) : displayedPlans.length === 0 ? (
                <div className="py-20 text-center border rounded-lg border-dashed border-muted/50 text-muted-foreground">
                    No subscription plans found.
                </div>
            ) : viewMode === 'table' ? (
                <ResourceTable<IPlan>
                    data={displayedPlans}
                    columns={columns}
                    onRowClick={(plan) => setEditingPlan(plan)}
                />
            ) : (
                <ResourceGrid count={displayedPlans.length}>
                    {displayedPlans.map((plan) => {
                        const actions: ActionItem[] = [
                            {
                                label: "Edit",
                                onClick: () => setEditingPlan(plan),
                            },
                            {
                                label: "Delete",
                                onClick: () => setDeleteId(plan._id),
                                variant: "destructive",
                            }
                        ];

                        return (
                            <ResourceCard
                                key={plan._id}
                                title={plan.name}
                                icon={CreditCard}
                                accentColor="primary"
                                status={
                                    plan.discountPercentage > 0 ? {
                                        label: `${plan.discountPercentage}% OFF`,
                                        variant: "success",
                                        className: "bg-green-500/10 text-green-600 border-green-500/20"
                                    } : undefined
                                }
                                subtitle1={plan.description}
                                metaItems={[
                                    {
                                        icon: Tag,
                                        label: (
                                            <div className="flex items-center gap-1.5">
                                                {plan.discountPercentage > 0 ? (
                                                    <>
                                                        <span className="line-through opacity-70">
                                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(plan.price)}
                                                        </span>
                                                        <span className="font-bold text-green-600 dark:text-green-400">
                                                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(plan.price * (1 - plan.discountPercentage / 100))}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(plan.price)}</span>
                                                )}
                                            </div>
                                        ),
                                        title: "Price"
                                    },
                                    {
                                        icon: Layers,
                                        label: `${plan.max_chatbot_count} Bots`,
                                        title: "Max Chatbots"
                                    },
                                    {
                                        icon: Layers,
                                        label: `${plan.max_document_count} Docs`,
                                        title: "Documents Limit"
                                    }
                                ]}
                                onClick={() => setEditingPlan(plan)}
                                actions={actions}
                            >
                                {plan.benefits && plan.benefits.length > 0 && (
                                    <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-3">
                                        {plan.benefits.map((benefit, i) => (
                                            <div key={i} className="flex items-center gap-1 text-[10px] bg-primary/5 text-primary px-2 py-0.5 rounded-md border border-primary/10">
                                                <CheckCircle className="w-2.5 h-2.5" />
                                                <span>{benefit}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {plan.is_public_chatbot_allowed && (
                                    <div className="flex items-center gap-1 text-green-600 dark:text-green-500 font-medium bg-green-500/10 px-1.5 py-0.5 rounded-full text-[10px] w-fit mt-2">
                                        <CheckCircle className="w-3 h-3" />
                                        <span>Public Chatbots</span>
                                    </div>
                                )}
                            </ResourceCard>
                        );
                    })}
                </ResourceGrid>
            )}

            <PlanFormDialog
                open={!!editingPlan || isCreateDialogOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingPlan(null);
                        setIsCreateDialogOpen(false);
                    }
                }}
                plan={editingPlan}
                onSuccess={() => { void refetch(); }}
            />

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Delete Plan"
                description="Are you sure you want to delete this plan? This action cannot be undone."
                confirmText="Delete"
                variant="destructive"
                onConfirm={() => { void handleDelete(); }}
            />
        </DashboardTabLayout>
    )
}
