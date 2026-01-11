import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LucideIcon, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export interface StatCardProps {
    label: string;
    value: number | string;
    icon: LucideIcon;
    iconBg?: string;
    iconColor?: string;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    loading?: boolean;
}

export function StatCard({
    label,
    value,
    icon: Icon,
    iconBg = "bg-primary/10",
    iconColor = "text-primary",
    change,
    changeType = "positive",
    loading = false
}: StatCardProps) {
    if (loading) {
        return (
            <Card className="overflow-hidden">
                <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-10 w-20" />
                    <Skeleton className="h-3 w-32" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="relative overflow-hidden group hover:shadow-xl border-border/50 hover:border-primary/30 transition-all duration-300">
            {/* Hover overlay */}
            <div className={`absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {label}
                </CardTitle>
                <div className={cn("p-3 rounded-xl transition-all duration-300 group-hover:scale-110", iconBg)}>
                    <Icon className={cn("h-5 w-5", iconColor)} />
                </div>
            </CardHeader>

            <CardContent className="space-y-1">
                <div className="text-4xl font-bold tracking-tight">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
                {change && (
                    <div className="flex items-center gap-2 text-sm">
                        <div className={cn(
                            "flex items-center gap-1",
                            changeType === 'positive' ? "text-success" :
                            changeType === 'negative' ? "text-destructive" : "text-muted-foreground"
                        )}>
                            <TrendingUp className={cn("h-3 w-3", changeType === 'negative' && "rotate-180")} />
                            <span className="font-semibold">{change}</span>
                        </div>
                        <span className="text-muted-foreground">from last month</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
