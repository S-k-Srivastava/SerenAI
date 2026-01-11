'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Users, Shield, Bot, MessageSquare, Mail, HelpCircle } from 'lucide-react';
import { startOfMonth } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { UnauthorizedState } from '@/components/common/UnauthorizedState';
import { LoadingState } from '@/components/common/LoadingState';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActionCard } from '@/components/dashboard/QuickActionCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { adminService } from '@/lib/api/services/adminService';
import { AIUsageStats } from '@/components/admin/AIUsageStats';
import { DateRange } from 'react-day-picker';

export default function AdminPage() {
    const { user, hasPermission, loading: authLoading } = useAuth();

    const [date, setDate] = React.useState<DateRange>({
        from: startOfMonth(new Date()),
        to: new Date(),
    });

    // Debounced date for API calls
    const [debouncedDate, setDebouncedDate] = React.useState<DateRange>(date);

    // Debounce date changes
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedDate(date);
        }, 500);

        return () => clearTimeout(timer);
    }, [date]);

    const { data: stats, isLoading: loading, isFetching, refetch, isError, error } = useQuery({
        queryKey: ['admin-stats', debouncedDate.from, debouncedDate.to],
        queryFn: async () => {
             if (!debouncedDate.from || !debouncedDate.to) {
                 throw new Error('Date range is required');
             }
             return await adminService.getStats(debouncedDate.from, debouncedDate.to);
        },
        enabled: !!user && !authLoading && hasPermission('read', 'admin_stats', 'all') && !!debouncedDate.from && !!debouncedDate.to,
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
        placeholderData: (previousData) => previousData,
    });

    React.useEffect(() => {
        if (isError) {
             toast.error(error?.message || "Failed to load admin statistics");
        }
    }, [isError, error]);

    if (authLoading) {
        return <LoadingState fullPage message="Loading admin dashboard..." size="lg" />;
    }

    if (!hasPermission('read', 'admin_stats', 'all')) {
        return <UnauthorizedState resource="Admin Dashboard" permission="read" />;
    }

    return (
        <PageWrapper>
            {/* Header */}
            <div className="flex flex-row items-center justify-between mb-10 gap-4">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
                            Admin Dashboard
                        </h1>
                        <Shield className="w-6 h-6 text-primary animate-pulse-glow" />
                    </div>
                    <p className="text-muted-foreground text-lg">
                        System overview and management
                    </p>
                </div>

                <Button
                    variant="outline-premium"
                    onClick={() => { void refetch(); }}
                    disabled={isFetching}
                    className="group h-10 w-auto px-4 shrink-0 rounded-xl"
                >
                    <RefreshCw className={cn("h-4 w-4 group-hover:rotate-180 transition-transform duration-500", isFetching && "animate-spin", "sm:mr-2")} />
                    <span className="hidden sm:inline">Refresh</span>
                </Button>
            </div>

            {/* System Overview Section */}
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-0.5">
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight">System Overview</h2>
                        <p className="text-xs md:text-sm text-muted-foreground">Platform statistics and key metrics</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Total Users"
                        value={stats?.users || 0}
                        icon={Users}
                        loading={loading}
                    />
                    <StatCard
                        label="Total Chatbots"
                        value={stats?.chatbots || 0}
                        icon={Bot}
                        loading={loading}
                    />
                    <StatCard
                        label="Total Conversations"
                        value={stats?.conversations || 0}
                        icon={MessageSquare}
                        loading={loading}
                        iconBg="bg-info/10"
                        iconColor="text-info"
                    />
                    <StatCard
                        label="Total Roles"
                        value={stats?.roles || 0}
                        icon={Shield}
                        loading={loading}
                        iconBg="bg-warning/10"
                        iconColor="text-warning"
                    />
                    {/* <StatCard
                        label="Total Plans"
                        value={stats?.plans || 0}
                        icon={CreditCard}
                        loading={loading}
                        iconBg="bg-success/10"
                        iconColor="text-success"
                    /> */}
                </div>
            </div>

            {/* AI Usage Section */}
            <div className="mb-12">
                <AIUsageStats
                    date={date}
                    onDateChange={(newDate) => {
                        // Ensure both from and to are always set
                        if (newDate?.from && newDate?.to) {
                            setDate(newDate);
                        }
                    }}
                    stats={stats}
                    isLoading={loading}
                />
            </div>

            {/* Management Section */}
            <div className="mb-12">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-0.5">
                        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Management</h2>
                        <p className="text-xs md:text-sm text-muted-foreground">Administrative tools and configuration</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        // Show 5 skeleton cards matching QuickActionCard structure
                        Array.from({ length: 5 }).map((_, index) => (
                            <Card key={index} className="h-full">
                                <CardContent className="p-6 flex items-center gap-4 h-full">
                                    <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-5 w-32" />
                                        <Skeleton className="h-4 w-full" />
                                    </div>
                                    <Skeleton className="h-5 w-5 rounded shrink-0" />
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <>
                            <QuickActionCard
                                href="/admin/users"
                                title="Manage Users"
                                description="View, edit, and create users"
                                icon={Users}
                                permission="read:user:all"
                            />

                            <QuickActionCard
                                href="/admin/roles"
                                title="Manage Roles"
                                description="Configure system roles and permissions"
                                icon={Shield}
                                permission="read:role:all"
                                iconBg="bg-warning/10"
                                iconColor="text-warning"
                                hoverBorderColor="hover:border-warning/30"
                            />

                            {/* <QuickActionCard
                                href="/admin/plans"
                                title="Manage Plans"
                                description="Configure subscription plans"
                                icon={CreditCard}
                                permission="read:plan:all"
                                iconBg="bg-success/10"
                                iconColor="text-success"
                                hoverBorderColor="hover:border-success/30"
                            /> */}

                            <QuickActionCard
                                href="/admin/contactus"
                                title="Contact Submissions"
                                description="View and respond to user inquiries"
                                icon={Mail}
                                permission="read:contact_us:all"
                                iconBg="bg-info/10"
                                iconColor="text-info"
                                hoverBorderColor="hover:border-info/30"
                            />

                            <QuickActionCard
                                href="/admin/help"
                                title="Help Center"
                                description="Manage support tickets"
                                icon={HelpCircle}
                                permission="read:help:all"
                                iconBg="bg-primary/10"
                                iconColor="text-primary"
                                hoverBorderColor="hover:border-primary/30"
                            />
                        </>
                    )}
                </div>
            </div>
        </PageWrapper>
    );
}
