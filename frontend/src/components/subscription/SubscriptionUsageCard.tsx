import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface SubscriptionUsageCardProps {
    planName: string;
    description?: string;
    status: 'active' | 'expired' | 'cancelled';
    startDate: string | Date;
    endDate: string | Date;
    usage: {
        chatbots: { used: number; max: number };
        documents: { used: number; max: number };
        shares: { used: number; max: number };
        publicBotsAllowed: boolean;
        maxWordsPerDoc: number;
    };
    onCancel?: () => void;
    isCancelPending?: boolean;
    compact?: boolean;
    className?: string;
}

export function SubscriptionUsageCard({
    planName,
    description,
    status,
    startDate,
    endDate,
    usage,
    onCancel,
    isCancelPending = false,
    compact = false,
    className
}: SubscriptionUsageCardProps) {
    // Helper to calculate percentage safely
    const getPercentage = (used: number, max: number) => {
        if (max === 0) return 0;
        return Math.min(100, (used / max) * 100);
    };

    const cardPadding = compact ? "pt-4 px-4 pb-4" : "pt-6 px-4 md:px-6 pb-6";
    const contentSpacing = compact ? "space-y-4" : "space-y-6";
    const headerPadding = compact ? "pb-3" : "pb-4";

    return (
        <Card className={cn("border-muted/60 shadow-sm overflow-hidden", className)}>
            <CardHeader className={cn("bg-muted/5 border-b", headerPadding)}>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className={cn("flex items-center gap-2", compact ? "text-base" : "")}>
                            <Sparkles className={cn("text-primary/60", compact ? "w-4 h-4" : "w-5 h-5")} /> 
                            Subscription & Usage
                        </CardTitle>
                        {!compact && (
                            <CardDescription className="mt-1">
                                {description || "Manage your plan and monitor resource usage."}
                            </CardDescription>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className={cn(cardPadding, contentSpacing)}>
                {/* Plan Details */}
                <div className={cn("flex items-center justify-between border-b border-muted/40", compact ? "pb-2" : "pb-3")}>
                    <div>
                        <div className="text-xs text-muted-foreground">Current Plan</div>
                        <div className={cn("font-bold text-foreground mt-0.5", compact ? "text-base" : "text-lg")}>
                            {planName}
                        </div>
                    </div>
                    <Badge variant={status === 'active' ? 'default' : 'destructive'} className={compact ? "text-xs px-2 py-0.5" : ""}>
                        {status.toUpperCase()}
                    </Badge>
                </div>

                {/* Dates */}
                <div className={cn("flex flex-col sm:flex-row gap-y-2 sm:gap-x-6 text-sm text-muted-foreground", compact ? "pb-1" : "pb-2")}>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Started: <span className="text-foreground font-medium">{format(new Date(startDate), 'MMM d, yyyy')}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>Expires: <span className="text-foreground font-medium">{format(new Date(endDate), 'MMM d, yyyy')}</span></span>
                    </div>
                </div>

                {/* Usage Progress Bars */}
                <div className={cn("space-y-4", compact ? "text-xs" : "text-sm")}>
                    {/* Chatbots Usage */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground font-medium">Chatbots</span>
                            <span className="font-medium text-foreground">{usage.chatbots.used} / {usage.chatbots.max}</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-muted/20">
                            <div
                                className="h-full bg-primary transition-all duration-500 shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                                style={{ width: `${getPercentage(usage.chatbots.used, usage.chatbots.max)}%` }}
                            />
                        </div>
                    </div>

                    {/* Documents Usage */}
                    <div className="space-y-1.5">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground font-medium">Documents</span>
                            <span className="font-medium text-foreground">{usage.documents.used} / {usage.documents.max}</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-muted/20">
                            <div
                                className="h-full bg-blue-500 transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                style={{ width: `${getPercentage(usage.documents.used, usage.documents.max)}%` }}
                            />
                        </div>
                    </div>

                    {/* Shares Usage - Progress Bar Style */}
                    <div className="space-y-1.5">
                         <div className="flex justify-between">
                            <span className="text-muted-foreground font-medium">Global Shares</span>
                            <span className="font-medium text-foreground">{usage.shares.used} / {usage.shares.max}</span>
                        </div>
                        <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-muted/20">
                             <div
                                className="h-full bg-violet-500 transition-all duration-500 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                                style={{ width: `${getPercentage(usage.shares.used, usage.shares.max)}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Other Stats Grid */}
                <div className="pt-3 grid grid-cols-2 gap-4 border-t border-muted/40">
                     <div className="space-y-1">
                        <div className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wide font-semibold">Public Bots</div>
                        <div className={cn("font-medium flex items-center gap-1.5", compact ? "text-xs" : "text-sm")}>
                            <div className={cn("w-2 h-2 rounded-full shadow-sm", usage.publicBotsAllowed ? "bg-green-500 shadow-green-500/50" : "bg-red-500 shadow-red-500/50")} />
                            {usage.publicBotsAllowed ? "Allowed" : "Not Allowed"}
                        </div>
                    </div>
                    <div className="space-y-1">
                         <div className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wide font-semibold">Words / Doc</div>
                         <div className={cn("font-medium", compact ? "text-xs" : "text-sm")}>
                             {usage.maxWordsPerDoc.toLocaleString()} words
                         </div>
                    </div>
                </div>
                
                {/* Admin Actions */}
                {onCancel && status === 'active' && (
                    <div className="pt-2 flex justify-end">
                        <Button
                            variant="destructive"
                            size={compact ? "sm" : "default"}
                            onClick={onCancel}
                            disabled={isCancelPending}
                            className={cn("w-full sm:w-auto", compact ? "h-8 text-xs" : "")}
                        >
                            {isCancelPending && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
                            Cancel Subscription
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
