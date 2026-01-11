import React, { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Plus, AlertCircle, Check, CreditCard, Tag, Layers } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { format } from "date-fns"
import { subscriptionService } from "../../lib/api/services/subscriptionService"
import { planService } from "../../lib/api/services/planService"
import { ResourceSelectionDialog } from "../common/ResourceSelectionDialog"
import { ResourceCard } from "../common/ResourceCard"
import { IPlan } from "../../types/plan"
import { ISubscription } from "../../types/subscription"
import { SubscriptionUsageCard } from "../../components/subscription/SubscriptionUsageCard"
import { cn } from "../../lib/utils"

interface UserSubscriptionsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    userId: string
    userName: string
}

export function UserSubscriptionsDialog({
    open,
    onOpenChange,
    userId,
    userName
}: UserSubscriptionsDialogProps) {
    const queryClient = useQueryClient();
    const [isPlanSelectionOpen, setIsPlanSelectionOpen] = useState(false);

    // Fetch subscriptions
    const { data: subscriptions = [], isLoading } = useQuery({
        queryKey: ['subscriptions', userId],
        queryFn: async () => {
             // Ensure we return an array. Use error boundary if needed.
             try {
                return await subscriptionService.getUserSubscriptions(userId);
             } catch (e) {
                 console.error(e);
                 return [];
             }
        },
        enabled: open && !!userId
    });

    const activeSubscription = subscriptions.find((s: ISubscription) => s.status === 'active');
    const pastSubscriptions = subscriptions.filter((s: ISubscription) => s.status !== 'active');

    // Mutations
    const createMutation = useMutation({
        mutationFn: (planId: string) => subscriptionService.createSubscription(userId, planId),
        onSuccess: () => {
            toast.success("Subscription assigned successfully");
            void queryClient.invalidateQueries({ queryKey:['subscriptions', userId] });
            setIsPlanSelectionOpen(false);
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to create subscription");
        }
    });

    const cancelMutation = useMutation({
        mutationFn: (subId: string) => subscriptionService.cancelSubscription(subId),
        onSuccess: () => {
             toast.success("Subscription cancelled");
             void queryClient.invalidateQueries({ queryKey:['subscriptions', userId] });
        },
         onError: (error: Error) => {
            toast.error(error.message || "Failed to cancel subscription");
        }
    });

    const handlePlanConfirm = (selectedPlans: IPlan[]) => {
        if (selectedPlans.length === 0) return;
        const plan = selectedPlans[0];
        createMutation.mutate(plan._id);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px]">
                <DialogHeader>
                    <DialogTitle>Manage Subscriptions</DialogTitle>
                    <DialogDescription>
                        Manage subscription plan for <span className="font-medium text-foreground">{userName}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4 max-h-[85vh] overflow-y-auto pr-2">
                    {/* Active Subscription Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Subscription</h3>
                            {!activeSubscription && (
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => setIsPlanSelectionOpen(true)}
                                    className="h-8 gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Subscription
                                </Button>
                            )}
                        </div>

                        {isLoading ? (
                            <Skeleton className="h-40 w-full" />
                        ) : activeSubscription ? (
                            <SubscriptionUsageCard
                                planName={activeSubscription.plan?.name || 'Unknown Plan'}
                                description={activeSubscription.plan?.description}
                                status={activeSubscription.status}
                                startDate={activeSubscription.start_date}
                                endDate={activeSubscription.end_date}
                                usage={{
                                    chatbots: {
                                        used: activeSubscription.usage_quotas?.used_chatbot_count || 0,
                                        max: activeSubscription.usage_quotas?.max_chatbot_count || 0
                                    },
                                    documents: {
                                        used: activeSubscription.usage_quotas?.used_document_count || 0,
                                        max: activeSubscription.usage_quotas?.max_document_count || 0
                                    },
                                    shares: {
                                        used: activeSubscription.usage_quotas?.used_chatbot_shares || 0,
                                        max: activeSubscription.usage_quotas?.max_chatbot_shares || 0
                                    },
                                    publicBotsAllowed: activeSubscription.usage_quotas?.is_public_chatbot_allowed || false,
                                    maxWordsPerDoc: activeSubscription.usage_quotas?.max_word_count_per_document || 0
                                }}
                                onCancel={() => cancelMutation.mutate(activeSubscription._id)}
                                isCancelPending={cancelMutation.isPending}
                                compact={true}
                            />
                        ) : (
                             <div className="flex flex-col items-center justify-center p-8 border rounded-lg border-dashed bg-muted/20">
                                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-muted-foreground font-medium">No active subscription</p>
                            </div>
                        )}
                    </div>

                    {/* History Section */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">History</h3>
                        {isLoading ? (
                            <div className="border rounded-lg divide-y">
                                {[1, 2].map((i) => (
                                    <div key={i} className="p-4 flex items-center justify-between">
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-3 w-48" />
                                        </div>
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                    </div>
                                ))}
                            </div>
                        ) : pastSubscriptions.length > 0 ? (
                            <div className="border rounded-lg divide-y">
                                {pastSubscriptions.map((sub: ISubscription) => (
                                    <div key={sub._id} className="p-4 flex items-center justify-between text-sm">
                                        <div>
                                            <div className="font-medium">{sub.plan?.name || 'Unknown Plan'}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {format(new Date(sub.start_date), 'MMM d, yyyy')} - {format(new Date(sub.end_date), 'MMM d, yyyy')}
                                            </div>
                                        </div>
                                        <Badge variant="secondary" className="capitalize">
                                            {sub.status}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-sm text-muted-foreground italic py-2">No past subscriptions</div>
                        )}
                    </div>
                </div>
            </DialogContent>

             <ResourceSelectionDialog<IPlan>
                open={isPlanSelectionOpen}
                onOpenChange={setIsPlanSelectionOpen}
                title="Select Plan"
                searchPlaceholder="Search plans..."
                fetchItems={planService.getAll}
                queryKeyPrefix="admin-plans"
                onConfirm={handlePlanConfirm}
                renderItem={(plan, isSelected, toggle) => (
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
                                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: plan.currency || 'INR' }).format(plan.price)}
                                                </span>
                                                <span className="font-bold text-green-600 dark:text-green-400">
                                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: plan.currency || 'INR' }).format(plan.price * (1 - plan.discountPercentage / 100))}
                                                </span>
                                            </>
                                        ) : (
                                            <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: plan.currency || 'INR' }).format(plan.price)}</span>
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
                        onClick={toggle}
                        className={cn(
                            "w-full cursor-pointer transition-all mb-3",
                            isSelected ? "border-primary bg-primary/5 shadow-sm" : ""
                        )}
                        footer={
                            isSelected && (
                                <div className="flex items-center gap-1.5 text-primary text-xs font-bold animate-in fade-in duration-200">
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Selected</span>
                                </div>
                            )
                        }
                    />
                )}
            />
        </Dialog>
    )
}
