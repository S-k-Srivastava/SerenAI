"use client"

import React, { useState } from "react"
import { DashboardTabLayout } from "@/components/layout/DashboardTabLayout"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Filter, MoreVertical, Shield } from "lucide-react"


import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { RoleFormDialog } from "@/components/admin/RoleFormDialog"
import { ConfirmDialog } from "@/components/common/ConfirmDialog"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useAuth } from "@/context/AuthContext"
import { LoadingState } from "@/components/common/LoadingState"
import { UnauthorizedState } from "@/components/common/UnauthorizedState"
import { useDebounce } from "@/hooks/useDebounce"
import { IRole } from "@/types/role"
import { IPermission } from "@/types/api"
import { getErrorMessage } from "@/lib/errorUtils"
import { useViewMode } from "@/context/ViewModeContext"
import { ResourceTable } from "@/components/common/ResourceTable"
import { ResourceGrid } from "@/components/common/ResourceGrid"
import { ResourceCard, ActionItem } from "@/components/common/ResourceCard"
import { Card } from "@/components/ui/card"
import { roleService } from "@/lib/api/services/roleService"
import { IPaginatedResult } from "@/types/common"

// Removed IPaginatedRolesResponse

export default function RolesPage() {
    const queryClient = useQueryClient();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<IRole | null>(null);
    const [deletingRole, setDeletingRole] = useState<IRole | null>(null);
    const [search, setSearch] = useState("");
    // const [statusFilter, setStatusFilter] = useState<string>("all");
    const debouncedSearch = useDebounce(search, 500);

    const [page, setPage] = useState(1);
    const limit = 12;
    const { viewMode } = useViewMode();

    const { hasPermission, loading: authLoading } = useAuth();

    // Reset page when search changes
    React.useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    const { data, isLoading, isFetching, refetch, isError, error } = useQuery<IPaginatedResult<IRole>>({
        queryKey: ['roles', page, debouncedSearch],
        queryFn: async () => {
            try {
                return await roleService.getAll({
                    page,
                    limit,
                    search: debouncedSearch
                });
            } catch (error) {
                // Keep existing error handling inside try-catch if it returns fallback data, 
                // but let's re-throw or rely on useQuery's error state if we want consistent behavior.
                // For now, if catch block handles it, isError might not trigger unless we throw.
                // However, the User requested useQuery handling.
                // Let's modify consistent with request: rely on useQuery error state where possible, 
                // OR if we keep try/catch, manual toast is fine.
                // The current code ALREADY has toast.error inside catch block!
                // So adding useEffect might duplication if we don't throw.
                // If I throw, then isError becomes true.
                throw error;
            }
        },
        enabled: !authLoading && hasPermission('read', 'role', 'all'),
        staleTime: 1000 * 60 * 3, // 3 minutes - roles don't change frequently
        gcTime: 1000 * 60 * 15, // 15 minutes
    });

    React.useEffect(() => {
        if (isError) {
             // Avoid double toast if the catch block also toasts. 
             // But if we throw, the catch block executes first.
             // Actually, looking at the code, the catch block catches locally and returns empty data. 
             // If we want the "isError" pattern requested by user "This toast should be shown in useQuery wherever its called",
             // we should probably let it bubble up or handle it here.
             // Given the catch block essentially swallows the error to return empty data, isError won't be true.
             // I will REMOVE the try/catch swallow to respect the "useQuery error handling" request effectively.
             toast.error(error?.message || "Failed to fetch roles");
        }
    }, [isError, error]);

    if (authLoading) {
        return <LoadingState fullPage message="Loading roles..." size="lg" />;
    }

    if (!hasPermission('read', 'role', 'all')) {
        return <UnauthorizedState resource="Roles Management" permission="read" />;
    }

    const roles = data?.data || [];
    const pagination = data?.pagination;
    const totalItems = pagination?.total || 0;
    const totalPages = pagination?.totalPages || Math.ceil(totalItems / limit);

    // No client-side filtering
    const filteredRoles = roles;

    const handleDelete = async () => {
        if (!deletingRole) return;
        try {
            await roleService.delete(deletingRole._id);
            toast.success("Role deleted successfully");
            setDeletingRole(null);
            void queryClient.invalidateQueries({ queryKey: ['roles'] });
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to delete role"));
        }
    };

    const columns = [
        {
            header: "Name",
            accessorKey: "name",
            width: 200,
            cell: (role: IRole) => <span className="font-medium">{role.name}</span>
        },
        {
            header: "Description",
            accessorKey: "description",
            width: 300,
            cell: (role: IRole) => <span className="text-muted-foreground line-clamp-1">{role.description}</span>
        },
        {
            header: "Permissions",
            width: 300,
            cell: (role: IRole) => {
                // const rolePermissions = role.permissions as IPermission[];
                return (
                    <div className="flex flex-wrap gap-1">
                        {(role.permissions as IPermission[]).map((p) => {
                            // Safe check for string vs object, though we cast to IPermission[]
                            if (typeof p === 'string') return null;
                            return (
                                <Badge key={p._id} variant="secondary" className="font-normal text-[10px] py-0 px-1.5">
                                    {p.resource}:{p.action}
                                </Badge>
                            );
                        })}
                        {(role.permissions as IPermission[]).length > 3 && (
                            <Badge variant="outline" className="font-normal text-[10px] py-0 px-1.5">
                                +{(role.permissions as IPermission[]).length - 3}
                            </Badge>
                        )}
                        {role.permissions.length === 0 && <span className="text-muted-foreground/40 text-xs italic">No permissions</span>}
                    </div>
                );
            }
        },
        {
            header: "Status",
            width: 100,
            cell: (role: IRole) => (
                <Badge variant={role.isActive ? 'default' : 'destructive'} className={cn("capitalize px-2 py-0.5 text-[10px]", role.isActive && "bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900")}>
                    {role.isActive ? 'Active' : 'Inactive'}
                </Badge>
            )
        },
        {
            header: "Actions",
            width: 100,
            align: 'center' as const,
            cell: (role: IRole) => (
                <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingRole(role)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                <span>Edit</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => setDeletingRole(role)}
                                disabled={role.name === 'admin' || role.name === 'user'}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    return (
        <DashboardTabLayout
            title="Roles"
            icon={Shield}
            description="Manage system roles and their permissions."
            search={{
                value: search,
                onChange: setSearch,
                placeholder: "Search roles..."
            }}
            refresh={{
                onRefresh: () => { void refetch(); },
                isRefreshing: isFetching
            }}
            create={{
                label: "Create Role",
                onClick: () => setIsCreateDialogOpen(true),
                permission: "create:role:all"
            }}

            pagination={
                !isLoading && totalPages > 0 ? {
                    currentPage: page,
                    totalPages: totalPages,
                    onPageChange: setPage,
                    isLoading: isFetching,
                    totalItems: totalItems,
                } : undefined
            }
        >
            {isLoading ? (
                <ResourceGrid count={6}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Card key={i} className="flex flex-row items-center p-4 border-muted/30 aspect-[4/1] animate-pulse">
                            <div className="h-10 w-10 bg-muted rounded-lg mr-3" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-1/2 bg-muted rounded" />
                                <div className="h-3 w-1/3 bg-muted rounded" />
                            </div>
                        </Card>
                    ))}
                </ResourceGrid>
            ) : filteredRoles.length === 0 ? (
                <div className="py-20 text-center border rounded-lg border-dashed border-muted/50 text-muted-foreground">
                    No roles found.
                </div>
            ) : viewMode === 'table' ? (
                <ResourceTable<IRole>
                    data={filteredRoles}
                    columns={columns}
                    onRowClick={(role) => setEditingRole(role)}
                />
            ) : (
                <ResourceGrid count={filteredRoles.length}>
                    {filteredRoles.map((role: IRole) => {
                        const rolePermissions = role.permissions as IPermission[];
                        const actions: ActionItem[] = [
                            {
                                label: "Edit",
                                icon: Pencil,
                                onClick: () => setEditingRole(role),
                            }
                        ];

                        if (role.name !== 'admin' && role.name !== 'user') {
                            actions.push({
                                label: "Delete",
                                icon: Trash2,
                                onClick: () => setDeletingRole(role),
                                variant: "destructive",
                            });
                        }

                        return (
                            <ResourceCard
                                key={role._id}
                                title={role.name}
                                icon={Shield}
                                accentColor="primary"
                                status={{
                                    label: role.isActive ? 'Active' : 'Inactive',
                                    variant: role.isActive ? 'success' : 'destructive',
                                    className: role.isActive ? "bg-green-500/10 text-green-600 border-green-500/20" : ""
                                }}
                                subtitle1={role.description}
                                metaItems={[
                                    { icon: Filter, label: `${rolePermissions.length} perms`, title: "Permissions" }
                                ]}
                                onClick={() => setEditingRole(role)}
                                actions={actions}
                            />
                        );
                    })}
                </ResourceGrid>
            )}

            <RoleFormDialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={() => { void queryClient.invalidateQueries({ queryKey: ['roles'] }); }}
            />

            {editingRole && (
                <RoleFormDialog
                    open={!!editingRole}
                    onOpenChange={(open) => !open && setEditingRole(null)}
                    roleId={editingRole._id}
                    initialData={{
                        name: editingRole.name,
                        description: editingRole.description || "",
                        permissions: (editingRole.permissions as IPermission[]).map(p => p._id)
                    }}
                    onSuccess={() => { void queryClient.invalidateQueries({ queryKey: ['roles'] }); }}
                />
            )}

            <ConfirmDialog
                open={!!deletingRole}
                onOpenChange={(open) => !open && setDeletingRole(null)}
                title="Delete Role"
                description={`Are you sure you want to delete the role "${deletingRole?.name}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="destructive"
                onConfirm={() => { void handleDelete(); }}
            />
        </DashboardTabLayout>
    );
}
