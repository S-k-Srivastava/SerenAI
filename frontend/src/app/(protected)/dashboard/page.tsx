'use client';

import React from 'react';
import { dashboardService } from '@/lib/api/services/dashboardService';
import { Button } from '@/components/ui/button';
import { FileText, Bot, MessageSquare, Plus, RefreshCw, Sparkles, UserCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { UnauthorizedState } from '@/components/common/UnauthorizedState';
import { LoadingState } from '@/components/common/LoadingState';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';

export default function DashboardPage() {
    const { user, hasPermission, loading: authLoading } = useAuth();

    const { data: stats = { documents: 0, chatbots: 0, conversations: 0 }, isLoading: loading, isFetching, refetch, isError, error } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            return await dashboardService.getStats();
        },
        enabled: !!user && !authLoading && hasPermission('read', 'dashboard', 'self'),
        staleTime: 1000 * 60 * 2, // 2 minutes - dashboard stats update frequently
        gcTime: 1000 * 60 * 10, // 10 minutes
    });

    React.useEffect(() => {
        if (isError) {
             toast.error(error?.message || "Failed to load dashboard statistics");
        }
    }, [isError, error]);

    if (authLoading) {
        return <LoadingState fullPage message="Loading dashboard..." size="lg" />;
    }

    if (!hasPermission('read', 'dashboard', 'self')) {
        return <UnauthorizedState resource="dashboard" permission="read" />;
    }

    return (
        <PageWrapper>
            {/* Header */}
            <div className="flex flex-row items-center justify-between mb-10 gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                            Dashboard
                        </h1>
                        <Sparkles className="w-6 h-6 text-primary animate-pulse-glow" />
                    </div>
                    <p className="text-muted-foreground text-lg">
                        Welcome back, <span className="font-semibold text-foreground">{user?.firstName || 'User'}</span>
                    </p>
                </div>
                <Button
                    variant="outline-premium"
                    onClick={() => { void refetch(); }}
                    disabled={isFetching}
                    className="group h-10 w-auto px-3 sm:px-4 shrink-0"
                >
                    <RefreshCw className={cn("h-4 w-4 group-hover:rotate-180 transition-transform duration-500", isFetching && "animate-spin", "sm:mr-2")} />
                    <span className="hidden sm:inline">Refresh</span>
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-12">
                <StatCard
                    label="Documents"
                    value={stats.documents}
                    icon={FileText}
                    change="+12%"
                    loading={loading}
                />
                <StatCard
                    label="Active Chatbots"
                    value={stats.chatbots}
                    icon={Bot}
                    change="+8%"
                    loading={loading}
                />
                <StatCard
                    label="Conversations"
                    value={stats.conversations}
                    icon={MessageSquare}
                    change="+24%"
                    iconBg="bg-info/10"
                    iconColor="text-info"
                    loading={loading}
                />
            </div>

            {/* Quick Actions */}
            <div className="mt-12 space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Plus className="w-5 h-5 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Quick Actions</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <QuickActionCard
                        href="/profile"
                        title="View Account"
                        description="Manage your profile"
                        icon={UserCircle}
                    />

                    <QuickActionCard
                        href="/chatbots"
                        title="View Chatbots"
                        description="Browse AI bots"
                        icon={Bot}
                        permission="read:chatbot:self"
                    />

                    <QuickActionCard
                        href="/chats"
                        title="View Chats"
                        description="Browse conversations"
                        icon={MessageSquare}
                        iconBg="bg-info/10"
                        iconColor="text-info"
                        hoverBorderColor="hover:border-info/30"
                        permission="read:chat:self"
                    />

                    <QuickActionCard
                        href="/documents"
                        title="View Documents"
                        description="Manage your files"
                        icon={FileText}
                        iconBg="bg-success/10"
                        iconColor="text-success"
                        hoverBorderColor="hover:border-success/30"
                        permission="read:document:self"
                    />
                </div>
            </div>
        </PageWrapper>
    );
}
