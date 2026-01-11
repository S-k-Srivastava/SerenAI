"use client"

import React, { useState } from "react"
import { DashboardTabLayout } from "@/components/layout/DashboardTabLayout"
import { Button } from "@/components/ui/button"
import { Shield, MoreVertical, Mail, UserCheck } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { LoadingState } from "@/components/common/LoadingState"
import { UnauthorizedState } from "@/components/common/UnauthorizedState"


import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { UserRoleDialog } from "@/components/admin/UserRoleDialog"

import { UserFormDialog } from "@/components/admin/UserFormDialog"
import { IUser, UsersResponse } from "@/types/user"
import { userService } from "@/lib/api/services/userService"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useDebounce } from "@/hooks/useDebounce"
import { ResourceTable } from "@/components/common/ResourceTable"
import { ResourceGrid } from "@/components/common/ResourceGrid"
import { ResourceCard, ActionItem } from "@/components/common/ResourceCard"
import { Card } from "@/components/ui/card"
import { useViewMode } from "@/context/ViewModeContext"
import { User } from "lucide-react"

// Removed local interfaces User and UsersResponse

export default function UsersPage() {
    const queryClient = useQueryClient();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [editingUser, setEditingUser] = useState<IUser | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const debouncedSearch = useDebounce(search, 500);
    const { viewMode } = useViewMode();
    const { hasPermission, loading: authLoading } = useAuth();

    // Reset page when search changes
    React.useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const { data, isLoading, isFetching, refetch, isError, error } = useQuery<UsersResponse>({
        queryKey: ['admin-users', page, debouncedSearch],
        queryFn: async () => {
             const params: Record<string, string | number> = {
                page,
                limit: 12
            };

            if (debouncedSearch) {
                params.search = debouncedSearch;
            }

            return await userService.getAll(params);
        },
        enabled: !authLoading && hasPermission('read', 'user', 'all'),
        staleTime: 1000 * 60 * 3, // 3 minutes - users don't change frequently
        gcTime: 1000 * 60 * 15, // 15 minutes
    });

    React.useEffect(() => {
        if (isError) {
            toast.error(error?.message || "Failed to fetch users");
        }
    }, [isError, error]);

    if (authLoading) {
        return <LoadingState fullPage message="Loading users..." size="lg" />;
    }

    if (!hasPermission('read', 'user', 'all')) {
        return <UnauthorizedState resource="Users Management" permission="read" />;
    }



    const users = data?.data || [];
    const pagination = data?.pagination;

    // Client-side filtering
    // Client-side filtering
    const displayedUsers = users;

    const columns = [
        {
            header: "Name",
            accessorKey: "firstName", // Combined cell logic
            width: 200,
            cell: (user: IUser) => (
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {user.firstName[0]}{user.lastName[0]}
                    </div>
                    <span className="font-medium truncate">{user.firstName} {user.lastName}</span>
                </div>
            )
        },
        {
            header: "Email",
            accessorKey: "email",
            width: 250,
            cell: (user: IUser) => <span className="text-muted-foreground">{user.email}</span>
        },
        {
            header: "Roles",
            width: 200,
            cell: (user: IUser) => (
                <div className="flex flex-wrap gap-1">
                    {user.roles.map(role => (
                        <Badge key={role._id} variant="secondary" className="font-normal text-[10px] py-0 px-1.5">
                            {role.name}
                        </Badge>
                    ))}
                    {user.roles.length === 0 && <span className="text-muted-foreground/40 text-xs italic">No roles</span>}
                </div>
            )
        },
        {
            header: "Status",
            width: 120,
            cell: (user: IUser) => (
                <Badge variant={user.isActive ? 'default' : 'destructive'} className={cn("capitalize px-2 py-0.5 text-[10px]", user.isActive && "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900")}>
                    {user.isActive ? 'Active' : 'Inactive'}
                </Badge>
            )
        },
        {
            header: "Actions",
            width: 100,
            align: 'center' as const,
            cell: (user: IUser) => (
                <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost-premium" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingUser(user)}>
                                <Shield className="mr-2 h-4 w-4" />
                                <span>Change Roles</span>
                            </DropdownMenuItem>
                            {/* <DropdownMenuItem onClick={() => { setSubscribingUser(user); setIsSubscriptionDialogOpen(true); }}>
                                <BadgePercent className="mr-2 h-4 w-4" />
                                <span>Subscriptions</span>
                            </DropdownMenuItem> */}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    return (
        <DashboardTabLayout
            title="Users"
            icon={User}
            description="Manage users and their assigned roles."
            search={{
                value: search,
                onChange: setSearch,
                placeholder: "Search users..."
            }}
            refresh={{
                onRefresh: () => { void refetch(); },
                isRefreshing: isFetching
            }}
            create={{
                label: "Create User",
                onClick: () => setIsCreateDialogOpen(true),
                permission: "create:user:all"
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
            ) : displayedUsers.length === 0 ? (
                <div className="py-20 text-center border rounded-lg border-dashed border-muted/50 text-muted-foreground">
                    No users found.
                </div>
            ) : viewMode === 'table' ? (
                <ResourceTable<IUser>
                    data={displayedUsers}
                    columns={columns}
                    onRowClick={(user) => setEditingUser(user)}
                />
            ) : (
                <ResourceGrid count={displayedUsers.length}>
                    {displayedUsers.map((user) => {
                        const actions: ActionItem[] = [
                            {
                                label: "Change Roles",
                                icon: Shield,
                                onClick: () => setEditingUser(user),
                            },
                            // {
                            //     label: "Subscriptions",
                            //     icon: BadgePercent,
                            //     onClick: () => { setSubscribingUser(user); setIsSubscriptionDialogOpen(true); },
                            // }
                        ];

                        return (
                            <ResourceCard
                                key={user._id}
                                title={`${user.firstName} ${user.lastName}`}
                                icon={User}
                                iconClassName="bg-primary/10 text-primary"
                                accentColor="primary"
                                status={{
                                    label: user.isActive ? 'Active' : 'Inactive',
                                    variant: user.isActive ? 'success' : 'destructive',
                                    className: user.isActive ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900" : ""
                                }}
                                subtitle1={user.email}
                                metaItems={[
                                    { icon: Mail, label: user.email, title: "Email" },
                                    { icon: UserCheck, label: `${user.roles.length} role${user.roles.length !== 1 ? 's' : ''}`, title: "Roles" }
                                ]}
                                onClick={() => setEditingUser(user)}
                                footer={
                                    <div className="flex flex-wrap gap-1">
                                        {user.roles.slice(0, 3).map(role => (
                                            <Badge key={role._id} variant="secondary" className="font-normal text-[10px] py-0 px-1.5">
                                                {role.name}
                                            </Badge>
                                        ))}
                                        {user.roles.length > 3 && (
                                            <Badge variant="secondary" className="font-normal text-[10px] py-0 px-1.5">
                                                +{user.roles.length - 3} more
                                            </Badge>
                                        )}
                                        {user.roles.length === 0 && <span className="text-muted-foreground/40 text-xs italic">No roles</span>}
                                    </div>
                                }
                                actions={actions}
                            />
                        );
                    })}
                </ResourceGrid>
            )}

            {editingUser && (
                <UserRoleDialog
                    open={!!editingUser}
                    onOpenChange={(open) => !open && setEditingUser(null)}
                    userId={editingUser._id}
                    userName={`${editingUser.firstName} ${editingUser.lastName}`}
                    currentRoleIds={editingUser.roles.map(r => r._id)}
                    onSuccess={() => { void queryClient.invalidateQueries({ queryKey: ['admin-users'] }); }}
                />
            )}

            {/* {subscribingUser && (
                <UserSubscriptionsDialog 
                    open={isSubscriptionDialogOpen}
                    onOpenChange={(open) => {
                        setIsSubscriptionDialogOpen(open);
                        if (!open) setSubscribingUser(null);
                    }}
                    userId={subscribingUser._id}
                    userName={`${subscribingUser.firstName} ${subscribingUser.lastName}`}
                />
            )} */}

            <UserFormDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={() => { void queryClient.invalidateQueries({ queryKey: ['admin-users'] }); }}
            />
        </DashboardTabLayout>
    )
}
