'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Bot, Calendar, Eye, EyeOff, Users, FileText, Thermometer, Hash, Zap, Settings, Palette } from 'lucide-react';
import { toast } from 'sonner';
import { PageWrapper } from "@/components/layout/PageWrapper";
import { useResourceName } from '@/context/ResourceNameContext';
import { chatbotService } from '@/lib/api/services/chatbotService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { ChatbotVisibilityEnum } from '@/types/chatbot';

export default function ViewChatbotPage() {
    const params = useParams();
    const router = useRouter();
    const { setResourceName } = useResourceName();

    const { data: chatbot, isLoading, isError, error } = useQuery({
        queryKey: ['chatbot', params.id],
        queryFn: async () => {
            return chatbotService.getById(params.id as string);
        },
        enabled: !!params.id,
        staleTime: 0,
        refetchOnMount: true
    });

    useEffect(() => {
        if (isError) {
            toast.error(error?.message || "Failed to load chatbot");
        }
    }, [isError, error]);

    useEffect(() => {
        if (chatbot) {
            setResourceName(chatbot.name);
        }
        return () => setResourceName(null);
    }, [chatbot, setResourceName]);

    if (isLoading) {
        return (
            <PageWrapper>
                <div className="animate-pulse space-y-8">
                    <div className="h-4 w-32 bg-muted rounded mb-6" />
                    <div className="flex items-center gap-4 mb-8">
                        <Skeleton className="h-12 w-12 rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-48" />
                            <Skeleton className="h-4 w-64" />
                        </div>
                    </div>
                    <Skeleton className="h-64 w-full" />
                </div>
            </PageWrapper>
        );
    }

    if (!chatbot) {
        return (
            <PageWrapper>
                <div className="text-center py-12">
                    <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-xl font-semibold mb-2">Chatbot not found</h2>
                    <p className="text-muted-foreground mb-6">The chatbot you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.</p>
                    <Link href="/chatbots">
                        <Button>Go to Chatbots</Button>
                    </Link>
                </div>
            </PageWrapper>
        );
    }

    return (
        <PageWrapper>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-start justify-between border-b pb-6">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center text-primary shadow-sm">
                            <Bot className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">{chatbot.name}</h1>
                            <p className="text-muted-foreground mt-1.5 text-base">View chatbot configuration and details</p>
                        </div>
                    </div>
                </div>

                {/* Configuration Section */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Configuration Overview</h2>
                        <p className="text-sm text-muted-foreground mt-1">General settings and behavior</p>
                    </div>

                    {/* First Row: 2 Columns */}
                    <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
                        {/* Chatbot Details Card */}
                        <Card className="border-muted/40 shadow-sm">
                        <CardHeader className="pb-4 border-b bg-muted/5">
                            <CardTitle className="text-xl">Chatbot Information</CardTitle>
                            <CardDescription>Configuration and behavior settings</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-1.5">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Name</span>
                                <div className="text-sm font-medium">{chatbot.name}</div>
                            </div>

                            <Separator />

                            <div className="space-y-1.5">
                                <span className="text-xs font-medium text-muted-foreground uppercase">System Prompt</span>
                                <div className="text-sm text-foreground/80 bg-muted/30 p-3 rounded-lg border">
                                    {chatbot.system_prompt || 'No system prompt configured'}
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-1.5">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Visibility</span>
                                <div className="flex items-center gap-2">
                                    {chatbot.visibility === ChatbotVisibilityEnum.PUBLIC ? (
                                        <>
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                            <Badge variant="default">Public</Badge>
                                            <span className="text-xs text-muted-foreground">Anyone can use this chatbot</span>
                                        </>
                                    ) : chatbot.visibility === ChatbotVisibilityEnum.SHARED ? (
                                        <>
                                            <Users className="h-4 w-4 text-muted-foreground" />
                                            <Badge variant="secondary">Shared</Badge>
                                            <span className="text-xs text-muted-foreground">Shared with specific users</span>
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                            <Badge variant="outline">Private</Badge>
                                            <span className="text-xs text-muted-foreground">Only you can access</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            {chatbot.visibility === ChatbotVisibilityEnum.SHARED && chatbot.shared_with && chatbot.shared_with.length > 0 && (
                                <>
                                    <Separator />
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-medium text-muted-foreground uppercase">Shared With</span>
                                        <div className="space-y-2">
                                            {chatbot.shared_with.map((user) => (
                                                <div key={user._id} className="flex items-center gap-2 text-sm bg-muted/30 p-2 rounded">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span>{user.firstName} {user.lastName}</span>
                                                    <span className="text-muted-foreground">({user.email})</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            <Separator />

                            <div className="space-y-1.5">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Connected Documents</span>
                                <div className="space-y-2">
                                    {chatbot.documents && chatbot.documents.length > 0 ? (
                                        chatbot.documents.map((doc) => (
                                            <div key={doc._id} className="flex items-center gap-2 text-sm bg-muted/30 p-2 rounded">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span>{doc.name}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <span className="text-sm text-muted-foreground">No documents connected</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                        {/* Sidebar Metadata */}
                        <Card className="border-muted/40 shadow-sm">
                        <CardHeader className="pb-4 border-b bg-muted/5">
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                                Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-6">
                            <div className="space-y-1.5">
                                <span className="text-xs font-medium text-muted-foreground uppercase">Active Status</span>
                                <div className="flex items-center gap-2">
                                    <Badge variant={chatbot.is_active ? 'default' : 'secondary'} className="capitalize">
                                        {chatbot.is_active ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <div className={`w-2 h-2 rounded-full ${chatbot.is_active ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                                </div>
                            </div>

                            <Separator className="bg-muted/40" />

                            <div className="space-y-1.5">
                                <span className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    Created
                                </span>
                                <div className="text-sm font-medium">
                                    {new Date(chatbot.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>

                            <Separator className="bg-muted/40" />

                            <div className="space-y-1.5">
                                <span className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-2">
                                    <Calendar className="h-3 w-3" />
                                    Last Updated
                                </span>
                                <div className="text-sm font-medium">
                                    {new Date(chatbot.updatedAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>

                            {chatbot.owner_name && (
                                <>
                                    <Separator className="bg-muted/40" />
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-medium text-muted-foreground uppercase">Owner</span>
                                        <div className="text-sm font-medium">{chatbot.owner_name}</div>
                                    </div>
                                </>
                            )}

                            <div className="space-y-1.5 font-mono text-[10px] break-all text-muted-foreground leading-relaxed pt-2">
                                <div className="flex justify-between">
                                    <span>ID:</span>
                                    <span>{chatbot._id}</span>
                                </div>
                            </div>

                            <Separator className="bg-muted/40" />

                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={() => router.push(`/chat/${chatbot._id}`)}
                                    className="w-full"
                                >
                                    Start Chat
                                </Button>
                                {chatbot.is_owner && (
                                    <Link href={`/chatbots/${chatbot._id}/edit`} className="w-full">
                                        <Button variant="outline" className="w-full">Edit Chatbot</Button>
                                    </Link>
                                )}
                                <Link href="/chatbots" className="w-full">
                                    <Button variant="ghost" className="w-full">Back to Chatbots</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                    </div>
                </div>

                {/* Separator */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-muted" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-4 text-muted-foreground font-medium tracking-wider">Advanced Settings</span>
                    </div>
                </div>

                {/* Advanced Configuration Section */}
                <div className="space-y-4">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">Model & Theme</h2>
                        <p className="text-sm text-muted-foreground mt-1">AI parameters and visual customization</p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        {/* Model Configuration Card */}
                        <Card className="border-muted/40 shadow-sm">
                            <CardHeader className="pb-4 border-b bg-muted/5">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Model Configuration
                                </CardTitle>
                                <CardDescription>AI model parameters and settings</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <span className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                                            <Thermometer className="h-3 w-3" />
                                            Temperature
                                        </span>
                                        <div className="text-lg font-bold text-primary">{chatbot.temperature}</div>
                                        <p className="text-xs text-muted-foreground">Controls randomness (0-2)</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <span className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                                            <Hash className="h-3 w-3" />
                                            Max Tokens
                                        </span>
                                        <div className="text-lg font-bold text-primary">{chatbot.max_tokens}</div>
                                        <p className="text-xs text-muted-foreground">Maximum response length</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-1.5">
                                    <span className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1">
                                        <Zap className="h-3 w-3" />
                                        View Source Documents
                                    </span>
                                    <Badge variant={chatbot.view_source_documents ? "default" : "secondary"}>
                                        {chatbot.view_source_documents ? "Enabled" : "Disabled"}
                                    </Badge>
                                    <p className="text-xs text-muted-foreground">
                                        {chatbot.view_source_documents
                                            ? "Users can see source documents in responses"
                                            : "Source documents are hidden from users"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Theme Preview Card */}
                        <Card className="border-muted/40 shadow-sm">
                            <CardHeader className="pb-4 border-b bg-muted/5">
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <Palette className="h-5 w-5" />
                                    Theme Configuration
                                </CardTitle>
                                <CardDescription>Visual styling and appearance</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <span className="text-xs font-medium text-muted-foreground uppercase">Light Mode</span>
                                        <div className="flex gap-2 flex-wrap">
                                            <div
                                                className="w-10 h-10 rounded-lg border-2 shadow-sm"
                                                style={{ backgroundColor: chatbot.theme.light.bg_color }}
                                                title="Background"
                                            />
                                            <div
                                                className="w-10 h-10 rounded-lg border-2 shadow-sm"
                                                style={{ backgroundColor: chatbot.theme.light.ai_bubble_color }}
                                                title="AI Bubble"
                                            />
                                            <div
                                                className="w-10 h-10 rounded-lg border-2 shadow-sm"
                                                style={{ backgroundColor: chatbot.theme.light.user_bubble_color }}
                                                title="User Bubble"
                                            />
                                            <div
                                                className="w-10 h-10 rounded-lg border-2 shadow-sm"
                                                style={{ backgroundColor: chatbot.theme.light.accent_color }}
                                                title="Accent"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <span className="text-xs font-medium text-muted-foreground uppercase">Dark Mode</span>
                                        <div className="flex gap-2 flex-wrap">
                                            <div
                                                className="w-10 h-10 rounded-lg border-2 shadow-sm"
                                                style={{ backgroundColor: chatbot.theme.dark.bg_color }}
                                                title="Background"
                                            />
                                            <div
                                                className="w-10 h-10 rounded-lg border-2 shadow-sm"
                                                style={{ backgroundColor: chatbot.theme.dark.ai_bubble_color }}
                                                title="AI Bubble"
                                            />
                                            <div
                                                className="w-10 h-10 rounded-lg border-2 shadow-sm"
                                                style={{ backgroundColor: chatbot.theme.dark.user_bubble_color }}
                                                title="User Bubble"
                                            />
                                            <div
                                                className="w-10 h-10 rounded-lg border-2 shadow-sm"
                                                style={{ backgroundColor: chatbot.theme.dark.accent_color }}
                                                title="Accent"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-3 gap-4 text-xs">
                                    <div className="space-y-1">
                                        <span className="text-muted-foreground uppercase">Bubble Radius</span>
                                        <div className="font-bold text-primary text-sm">{chatbot.theme.msg_bubble_radius}px</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-muted-foreground uppercase">Input Radius</span>
                                        <div className="font-bold text-primary text-sm">{chatbot.theme.input_radius}px</div>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-muted-foreground uppercase">Shadow</span>
                                        <div className="font-bold text-primary text-sm capitalize">{chatbot.theme.shadow_intensity}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
}
