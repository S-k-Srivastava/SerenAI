'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/lib/api/services/authService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { Mail, Shield, Check, Lock, Sparkles, Calendar, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
// import { SubscriptionUsageCard } from '@/components/subscription/SubscriptionUsageCard';
import { DashboardTabLayout } from '@/components/layout/DashboardTabLayout';
// import { useRouter } from 'next/navigation';

const profileSchema = z.object({
    firstName: z.string().min(2, "First Name must be at least 2 characters"),
    lastName: z.string().min(2, "Last Name must be at least 2 characters"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
    const { user, updateUser } = useAuth();
    // const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
        },
    });

    React.useEffect(() => {
        if (user) {
            form.reset({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
            });
        }
    }, [user, form]);

    const handleUpdate = async (data: ProfileFormValues) => {
        setIsLoading(true);
        try {
            const { data: responseData } = await authService.updateProfile(data);
            updateUser(responseData.user);
            toast.success('Account updated successfully');
        } catch (error) {
            console.error(error);
            toast.error('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <DashboardTabLayout
            title="Account Settings"
            icon={Settings}
            description="Manage your personal information and security preferences."
            showViewModeToggle={false}
        >
            <div className="grid gap-8 lg:grid-cols-[350px_1fr] items-start">
                {/* Left Column: User Identity */}
                <div className="h-full">
                    <Card className="overflow-hidden border-muted/60 shadow-md h-full flex flex-col">
                        <div className="h-32 bg-gradient-to-br from-primary/20 via-cyan-500/10 to-background relative shrink-0">
                            <div className="absolute -bottom-12 left-6">
                                <div className="h-24 w-24 rounded-full bg-background p-1 shadow-xl">
                                    <div className="h-full w-full rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary border border-muted/50">
                                        {(user.firstName?.[0] || 'U')}{(user.lastName?.[0] || '')}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <CardContent className="pt-14 px-6 pb-8 space-y-6 flex-1">
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight">{user.firstName} {user.lastName}</h2>
                                <div className="flex items-center gap-2 text-muted-foreground mt-1.5 font-medium">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm">{user.email}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                                <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                                    <Shield className="w-3.5 h-3.5 mr-1.5" />
                                    {typeof user.roles?.[0] === 'object' ? user.roles[0].name : 'User'}
                                </Badge>
                                <Badge variant="outline" className="px-3 py-1 border-orange-500/20 text-orange-600 bg-orange-500/5 hover:bg-orange-500/10 transition-colors">
                                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                                    Pro Member
                                </Badge>
                            </div>

                            <Separator className="bg-muted/60" />

                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between items-center group cursor-default">
                                    <span className="text-muted-foreground flex items-center gap-2 transition-colors group-hover:text-foreground">
                                        <Calendar className="w-4 h-4" /> Joined
                                    </span>
                                    <span className="font-semibold text-foreground/80">December 2025</span>
                                </div>
                                <div className="flex justify-between items-center group cursor-default">
                                    <span className="text-muted-foreground transition-colors group-hover:text-foreground">Status</span>
                                    <span className="font-semibold text-green-600 flex items-center gap-1.5">
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse" />
                                        Active
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Edit Forms */}
                <div className="space-y-8">
                    {/* Subscription & Usage - Replaces the fixed Card with dynamic component logic */}
                    {/* {user.roles.some(r => typeof r === 'string' ? r === 'admin' : r.name === 'admin') ? (
                         <Card className="border-muted/60 shadow-sm overflow-hidden">
                            <CardHeader className="bg-muted/5 border-b pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary/60" /> Subscription & Usage
                                </CardTitle>
                                <CardDescription>Manage your plan and monitor resource usage.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
                                    <p className="text-sm text-center text-primary font-medium">You are an Administrator with unlimited access.</p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : subscription && quota ? (
                        <SubscriptionUsageCard
                            planName={subscription.plan?.name || 'Premium Plan'}
                            status={subscription.status}
                            startDate={subscription.start_date}
                            endDate={subscription.end_date}
                            usage={{
                                chatbots: { 
                                    used: usage?.chatbot_count || 0, 
                                    max: quota.max_chatbot_count 
                                },
                                documents: { 
                                    used: usage?.document_count || 0, 
                                    max: quota.max_document_count 
                                },
                                shares: { 
                                    used: quota.used_chatbot_shares || 0, 
                                    max: quota.max_chatbot_shares 
                                },
                                publicBotsAllowed: quota.is_public_chatbot_allowed,
                                maxWordsPerDoc: quota.max_word_count_per_document
                            }}
                        />
                    ) : (
                        <Card className="border-muted/60 shadow-sm overflow-hidden">
                            <CardHeader className="bg-muted/5 border-b pb-4">
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-primary/60" /> Subscription & Usage
                                </CardTitle>
                                <CardDescription>Manage your plan and monitor resource usage.</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="text-center py-4 space-y-3">
                                    <div className="p-3 bg-muted/30 rounded-full w-fit mx-auto">
                                        <Sparkles className="w-6 h-6 text-muted-foreground" />
                                    </div>
                                    <div>
                                        <p className="font-medium">No Active Subscription</p>
                                        <p className="text-sm text-muted-foreground mt-1">Upgrade to unlock more features and higher limits.</p>
                                    </div>
                                    <Button variant="outline" className="mt-2" onClick={() => router.push('/#pricing')}>View Plans</Button>
                                </div>
                            </CardContent>
                        </Card>
                    )} */}
                    {/* Personal Info */}
                    <Card className="border-muted/60 shadow-sm overflow-hidden group">
                        <CardHeader className="bg-muted/5 border-b pb-4">
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Update your display name and public details.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <Form {...form}>
                                <form onSubmit={(e) => { void form.handleSubmit(handleUpdate)(e); }} className="space-y-6">
                                    <div className="grid gap-6 sm:grid-cols-2">
                                        <div className="space-y-2.5">
                                            <FormField
                                                control={form.control}
                                                name="firstName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-foreground/80 ml-0.5">First Name</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter your first name"
                                                                className="transition-all"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="space-y-2.5">
                                            <FormField
                                                control={form.control}
                                                name="lastName"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-foreground/80 ml-0.5">Last Name</FormLabel>
                                                        <FormControl>
                                                            <Input
                                                                placeholder="Enter your last name"
                                                                className="transition-all"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-muted/40">
                                        <PermissionGuard permission="update:profile:self">
                                            <Button type="submit" variant="gradient" disabled={isLoading} size="lg" className="min-w-[140px] shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                                                {isLoading ? (
                                                    <>
                                                        <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mr-2" />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Check className="w-4 h-4 mr-2" />
                                                        Save Changes
                                                    </>
                                                )}
                                            </Button>
                                        </PermissionGuard>
                                    </div>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>

                    {/* Security Placeholder */}
                    <Card className="border-muted/60 shadow-sm opacity-90 hover:opacity-100 transition-opacity">
                        <CardHeader className="bg-muted/5 border-b pb-4">
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="w-5 h-5 text-primary/60" /> Security Settings
                            </CardTitle>
                            <CardDescription>Manage your password and authentication preferences.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between p-5 border border-muted/60 rounded-xl bg-primary/5 group/sec hover:bg-primary/10 transition-all cursor-default">
                                <div className="space-y-1.5">
                                    <div className="font-semibold text-foreground/80">Account Password</div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                        Last changed 3 months ago
                                    </div>
                                </div>
                                <Button variant="outline" size="sm" className="bg-background hover:bg-primary hover:text-primary-foreground transition-all">
                                    Change Password
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardTabLayout>
    );
}
