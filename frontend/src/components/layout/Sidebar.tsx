"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import {
    LayoutDashboard,
    Bot,
    MessageSquare,
    FileText,
    Plus,
    LogOut,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Search,
    MoreHorizontal,
    Pencil,
    Check,
    X,
    Trash2,
    User,
    MessageCircle,
    Shield,
    HelpCircle,
    Server,
    LucideIcon,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
// Ensure you have auth context or similar if needed for logout
import { useAuth } from "@/context/AuthContext";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import React, { useState, useEffect } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { chatService } from "@/lib/api/services/chatService"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useResourceName } from "@/context/ResourceNameContext"
import { ResourceSelectionDialog } from "@/components/common/ResourceSelectionDialog"
import { ResourceCard } from "@/components/common/ResourceCard"
import { chatbotService } from "@/lib/api/services/chatbotService"
import { IChatbot } from "@/types/chatbot"


interface NavPermission {
    action: string;
    resource: string;
    scope?: string;
}

interface NavItem {
    icon: LucideIcon;
    label: string;
    href: string;
    permission?: NavPermission;
    permissions?: NavPermission[];
    variant?: string;
}

const navItems: NavItem[] = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard", permission: { action: 'read', resource: 'dashboard', scope: 'self' } },
    { icon: Bot, label: "Chatbots", href: "/chatbots", permission: { action: 'read', resource: 'chatbot', scope: 'self' } },
    { icon: MessageCircle, label: "Chats", href: "/chats", permission: { action: 'read', resource: 'chat', scope: 'self' } },
    { icon: FileText, label: "Documents", href: "/documents", permission: { action: 'read', resource: 'document', scope: 'self' } },
    { icon: Server, label: "LLM Configs", href: "/llmconfigs", permission: { action: 'read', resource: 'llm_config', scope: 'self' } },
    { icon: HelpCircle, label: "Help Center", href: "/help", permission: { action: 'read', resource: 'help', scope: 'self' } },
    {
        icon: Shield,
        label: 'Admin',
        href: '/admin',
        permissions: [
            { action: 'read', resource: 'admin_stats', scope: 'all' },
            { action: 'read', resource: 'user', scope: 'all' },
            { action: 'read', resource: 'role', scope: 'all' },
            { action: 'read', resource: 'help', scope: 'all' },
        ],
        variant: 'ghost-premium'
    },
    { icon: User, label: "Account", href: "/profile", permission: { action: 'read', resource: 'profile', scope: 'self' } },
]

interface RecentChat {
    _id: string;
    chatbot: {
        _id: string;
        name: string;
    };
    title?: string;
    last_message_at: string;
}

export const Sidebar: React.FC<{ className?: string }> = ({ className }) => {
    const pathname = usePathname()
    const router = useRouter()
    const { logout, user, hasPermission } = useAuth()
    const queryClient = useQueryClient()
    const { setResourceName } = useResourceName()

    const [collapsed, setCollapsed] = useState(false);
    const [isSelectionDialogOpen, setIsSelectionDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [isStartingChat, setIsStartingChat] = useState(false);

    const { data: recentChatsData, isLoading: loading, isError, error } = useQuery({
        queryKey: ['recent-chats'],
        queryFn: async () => {
            const result = await chatService.getAll({ limit: 5, page: 1 });
            return result.data;
        },
        enabled: !!user && hasPermission('read', 'chat', 'self')
    });

    useEffect(() => {
        if (isError) {
            // We might suppress this specific one if we don't want to annoy user on sidebar load failures?
            // But per request: "This toast should be shown in useQuery wherever its called"
             toast.error(error?.message || "Failed to load recent chats");
        }
    }, [isError, error]);

    // recentChatsData is now IConversationListItem[]
    const recentChats = recentChatsData || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filteredRecentChats = recentChats.filter((chat: RecentChat | any) => {
        const titleMatch = (chat.title || '').toLowerCase().includes(searchQuery.toLowerCase());
        const botNameMatch = (chat.chatbot?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
        return titleMatch || botNameMatch;
    });

    const handleRename = async (chatId: string) => {
        if (!editTitle.trim()) {
            setEditingId(null);
            return;
        }

        setIsRenaming(true);
        try {
            await chatService.updateTitle(chatId, { title: editTitle });

            // Sync with ResourceNameContext if this chat is currently open
            const chats = recentChats as RecentChat[];
            const chatObj = chats.find((c) => c._id === chatId);
            if (chatObj && pathname === `/chat/${chatObj._id}`) {
                setResourceName(editTitle);
            }

            void queryClient.invalidateQueries({ queryKey: ['recent-chats'] });
            void queryClient.invalidateQueries({ queryKey: ['chat', chatId] });
            toast.success("Chat renamed successfully");
            setEditingId(null);
        } catch {
            toast.error("Failed to rename chat");
        } finally {
            setIsRenaming(false);
        }
    };

    const handleDeleteChat = async () => {
        if (!deleteId) return;
        try {
            await chatService.delete(deleteId);
            void queryClient.invalidateQueries({ queryKey: ['recent-chats'] });
            toast.success("Conversation deleted");

            // Redirect if we are currently on this chat
            if (pathname === `/chat/${deleteId}`) {
                // Use a comprehensive reload/redirect strategy
                window.location.href = '/dashboard';
            }
        } catch {
            toast.error("Failed to delete conversation");
        } finally {
            setDeleteId(null);
        }
    };

    const handleStartChat = async (selectedBots: IChatbot[]) => {
        if (!selectedBots.length) return;
        
        setIsStartingChat(true);
        try {
            // We only support single select for starting a chat
            const botId = selectedBots[0]._id;
            const result = await chatbotService.startChat(botId);
            void queryClient.invalidateQueries({ queryKey: ['recent-chats'] });
            setIsSelectionDialogOpen(false);
            router.push(`/chat/${result.conversationId}`);
        } catch (error) {
            console.error("Failed to start conversation", error);
            toast.error("Failed to start conversation. Please try again.");
            setIsStartingChat(false); // Only unset if failed, otherwise navigation happens
        }
    };

    return (
        <aside className={cn(
            "bg-background border-r border-border flex-shrink-0 flex flex-col h-full transition-all duration-300 relative",
            // If className is passed, use it. Otherwise default to hidden lg:flex
            className ? className : "hidden lg:flex",
            collapsed ? "w-[50px]" : "w-64",
            // Ensure width override works if className sets w-full
            className?.includes("w-") ? "" : (collapsed ? "w-[50px]" : "w-64")
        )}>
            <ResourceSelectionDialog<IChatbot>
                open={isSelectionDialogOpen}
                onOpenChange={setIsSelectionDialogOpen}
                title="Select a Chatbot"
                description="Choose an assistant to start a new conversation."
                searchPlaceholder="Search chatbots..."
                queryKeyPrefix="chatbot-selection"
                fetchItems={chatbotService.getAll}
                multiSelect={false}
                confirmLabel={isStartingChat ? "Starting..." : "Start Chat"}
                onConfirm={(items) => { void handleStartChat(items); }}
                renderItem={(bot, isSelected, toggle) => (
                    <ResourceCard
                        key={bot._id}
                        title={bot.name}
                        icon={Bot}
                        subtitle1={bot.system_prompt || 'No description'}
                        accentColor={bot.is_active ? "primary" : "warning"}
                        status={{
                            label: bot.is_active ? 'Active' : 'Inactive',
                            variant: bot.is_active ? 'success' : 'secondary'
                        }}
                        onClick={toggle}
                        className={cn(
                            "w-full mb-3",
                            isSelected ? "border-primary bg-primary/5 shadow-sm" : ""
                        )}
                        metaItems={[
                            { 
                                icon: FileText, 
                                label: `${bot.documents?.length || 0} docs`,
                                title: "Number of knowledge base documents"
                            }
                        ]}
                        footer={bot.is_owner ? 'Owner' : bot.owner_name}
                    />
                )}
            />
            
            {/* Toggle Button - Hide if custom className is provided (mobile) */}
            {!className && (
                <Button
                    variant="outline-premium"
                    size="icon"
                    className="absolute -right-3 top-6 h-6 w-6 rounded-full shadow-md z-10 hidden lg:flex items-center justify-center p-0"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
                </Button>
            )}

            {/* Logo Area */}
            <Link
                href="/"
                className={cn(
                    "p-4 border-b border-border flex items-center gap-3 overflow-hidden whitespace-nowrap hover:opacity-80 transition-opacity",
                    collapsed && !className ? "justify-center p-2" : ""
                )}
            >
                <div className="flex-shrink-0 flex items-center justify-center">
                    <Image
                        src="/logo.png"
                        alt="SerenAI Logo"
                        width={40}
                        height={40}
                        priority
                        className={cn("transition-all duration-300", collapsed && !className ? "w-9 h-9" : "w-10 h-10")}
                    />
                </div>
                {(!collapsed || !!className) && (
                    <span className="font-bold text-lg tracking-tight animate-in fade-in duration-200">SerenAI</span>
                )}
            </Link>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto overflow-x-hidden p-2 flex flex-col gap-6 scrollbar-thin scrollbar-thumb-muted">
                <div>
                    {(!collapsed || !!className) && (
                        <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 px-3 animate-in fade-in">Workspaces</div>
                    )}
                    <ul className="flex flex-col gap-1">
                        {navItems
                            .filter(item => {
                                if (item.permissions) {
                                    return item.permissions.some(p => hasPermission(p.action, p.resource, p.scope || 'self'));
                                }
                                return !item.permission || hasPermission(item.permission.action, item.permission.resource, item.permission.scope || 'self');
                            })
                            .map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        title={collapsed && !className ? item.label : undefined}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2 rounded-lg font-medium group transition-all",
                                            pathname.startsWith(item.href)
                                                ? "bg-primary/10 text-primary dark:bg-card dark:text-foreground"
                                                : "hover:bg-muted text-muted-foreground hover:text-foreground",
                                            collapsed && !className ? "justify-center px-0" : ""
                                        )}
                                    >
                                        <item.icon className={cn(
                                            "w-5 h-5 transition-colors flex-shrink-0",
                                            pathname.startsWith(item.href) ? "text-primary" : "group-hover:text-primary"
                                        )} />
                                        {(!collapsed || !!className) && (
                                            <span className="truncate flex-1 relative flex items-center gap-2">
                                                {item.label}
                                                {item.label === 'Admin' && (
                                                    <span className="ml-auto px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold bg-primary/10 text-primary uppercase border border-primary/20 leading-none">
                                                        Admin
                                                    </span>
                                                )}
                                            </span>
                                        )}
                                    </Link>
                                </li>
                            ))}
                    </ul>
                </div>

                {/* Recent Chats */}
                <div className="flex-1">
                    <PermissionGuard permission="read:chat:self">
                        <>
                            {(!collapsed || !!className) && (
                                <div className="flex items-center justify-between mb-2 px-3 animate-in fade-in">
                                    <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                                        Recent Chats
                                    </h3>
                                    <div className="flex items-center gap-1.5">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowSearch(!showSearch)}
                                            className={cn(
                                                "h-6 w-6 text-muted-foreground hover:text-primary transition-colors hover:bg-transparent",
                                                showSearch && "text-primary bg-primary/10"
                                            )}
                                            title="Search Chats"
                                        >
                                            <Search className="w-4 h-4" />
                                        </Button>
                                        <PermissionGuard permission="create:chat:self">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setIsSelectionDialogOpen(true)}
                                                className="h-6 w-6 text-muted-foreground hover:text-primary transition-colors hover:bg-transparent"
                                                title="New Chat"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </PermissionGuard>
                                    </div>
                                </div>
                            )}

                            {(!collapsed || !!className) && showSearch && (
                                <div className="px-3 mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="relative group">
                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input
                                            type="text"
                                            placeholder="Search chats..."
                                            className="w-full bg-muted/50 border-transparent focus:border-primary/30 focus:bg-background h-8 pl-8 pr-2 rounded-md text-xs transition-all"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {(collapsed && !className) ? (
                                <div className="flex justify-center pt-4 border-t mt-2">
                                    <PermissionGuard permission="create:chat:self">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIsSelectionDialogOpen(true)}
                                            title="New Chat"
                                            className="text-muted-foreground hover:text-primary transition-colors"
                                        >
                                            <MessageSquare className="w-5 h-5" />
                                        </Button>
                                    </PermissionGuard>
                                </div>
                            ) : loading ? (
                                <div className="space-y-2 px-3">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="space-y-1.5">
                                            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                                            <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                                        </div>
                                    ))}
                                </div>
                            ) : recentChats.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                    No recent chats
                                </div>
                            ) : filteredRecentChats.length === 0 ? (
                                <div className="px-3 py-2 text-xs text-muted-foreground italic">
                                    No matches found
                                </div>
                            ) : (
                                <ul className="flex flex-col gap-1">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {filteredRecentChats.map((chat: RecentChat | any) => (
                                        <li key={chat._id} className="group relative">
                                            {editingId === chat._id ? (
                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg border border-primary/30 mx-1">
                                                    <Input
                                                        autoFocus
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') void handleRename(chat._id);
                                                            if (e.key === 'Escape') setEditingId(null);
                                                        }}
                                                        className="bg-transparent text-sm w-full border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-auto p-0"
                                                    />
                                                    <Button variant="ghost" size="icon" className="h-4 w-4 hover:bg-transparent" onClick={() => { void handleRename(chat._id); }} disabled={isRenaming}>
                                                        {isRenaming ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5 text-primary" />}
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-4 w-4 hover:bg-transparent" onClick={() => setEditingId(null)}>
                                                        <X className="w-3.5 h-3.5 text-muted-foreground" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Link
                                                        href={`/chat/${chat._id}`}
                                                        className={cn(
                                                            "flex items-center gap-3 px-3 py-2 rounded-lg border border-transparent transition-colors truncate pr-8",
                                                            pathname === `/chat/${chat._id}`
                                                                ? "bg-muted border-border font-medium text-foreground"
                                                                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full shrink-0",
                                                            pathname === `/chat/${chat._id}` ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-slate-300 dark:bg-slate-700"
                                                        )}></div>
                                                        <div className="flex flex-col min-w-0 flex-1">
                                                            <span className="truncate text-sm">
                                                                {chat.title || chat.chatbot?.name || 'Unknown Bot'}
                                                            </span>
                                                            {chat.last_message_at && (
                                                                <span className="truncate text-xs text-muted-foreground">
                                                                    {new Date(chat.last_message_at).toLocaleString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        hour: 'numeric',
                                                                        minute: '2-digit',
                                                                        hour12: true
                                                                    })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </Link>

                                                    {/* Dropdown Menu (3 dots) */}
                                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                 <Button variant="ghost" size="icon" className="h-6 w-6 flex items-center justify-center rounded-md hover:bg-background/80 text-muted-foreground hover:text-foreground transition-all">
                                                                    <MoreHorizontal className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end" className="w-32">
                                                                <DropdownMenuItem
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        setEditingId(chat._id);
                                                                        setEditTitle(chat.title || chat.chatbot?.name || "");
                                                                    }}
                                                                    className="cursor-pointer"
                                                                >
                                                                    <Pencil className="w-4 h-4 mr-2" />
                                                                    Rename
                                                                </DropdownMenuItem>
                                                                <PermissionGuard permission="delete:chat:self">
                                                                    <DropdownMenuItem
                                                                        onClick={(e) => {
                                                                            e.preventDefault();
                                                                            setDeleteId(chat._id);
                                                                        }}
                                                                        className="cursor-pointer text-destructive focus:text-destructive"
                                                                    >
                                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </PermissionGuard>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    </PermissionGuard>
                </div>
            </nav>

            {/* User Profile */}
            <div className={cn(
                "border-t border-border bg-muted/20 overflow-hidden",
                collapsed && !className ? "p-2" : "p-4"
            )}>
                <div className={cn(
                    "flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity",
                    collapsed && !className ? "justify-center" : ""
                )}
                
                // Add click handler for profile if needed, currently none
                >
                    <div className="h-8 w-8 rounded-full bg-primary/10 border border-border flex items-center justify-center text-primary font-bold text-xs flex-shrink-0">
                        {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                    </div>
                    {(!collapsed || !!className) && (
                        <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-semibold truncate text-foreground">
                                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}
                            </span>
                            <span className="text-xs text-muted-foreground truncate">{user?.email || "user@example.com"}</span>
                        </div>
                    )}
                    {(!collapsed || !!className) && (
                        <Button
                                            variant="ghost"
                                            size="icon"
                                            title="Logout"
                                            className="h-6 w-6 text-muted-foreground hover:text-destructive transition-colors ml-auto mr-2 hover:bg-transparent"
                                            onClick={() => setShowLogoutDialog(true)}
                                        >
                                            <LogOut className="w-4 h-4" />
                                        </Button>
                    )}
                </div>
            </div>

            <ConfirmDialog
                open={showLogoutDialog}
                onOpenChange={setShowLogoutDialog}
                title="Log out"
                description="Are you sure you want to log out of your account?"
                confirmText="Log out"
                onConfirm={logout}
                variant="destructive"
            />

            <ConfirmDialog
                open={!!deleteId}
                onOpenChange={(open) => !open && setDeleteId(null)}
                title="Delete Conversation"
                description="Are you sure you want to delete this conversation? This action cannot be undone."
                confirmText="Delete"
                variant="destructive"
                onConfirm={() => { void handleDeleteChat(); }}
            />
        </aside>
    )
}
