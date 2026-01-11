import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getErrorMessage } from "@/lib/errorUtils";
import { IRole } from '@/types/role';
import { useQuery } from '@tanstack/react-query';
import { roleService } from '@/lib/api/services/roleService';
import { userService } from '@/lib/api/services/userService';

interface UserRoleDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    userId: string;
    userName: string;
    currentRoleIds: string[];
    onSuccess: () => void;
}

export const UserRoleDialog: React.FC<UserRoleDialogProps> = ({
    open,
    onOpenChange,
    userId,
    userName,
    currentRoleIds,
    onSuccess,
}) => {
    const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
    const [submitting, setSubmitting] = useState(false);

    // Use React Query for roles with caching (same cache key as RoleFormDialog for consistency)
    const { data: roles = [], isLoading: loading, isError, error } = useQuery({
        queryKey: ['roles-for-user-assignment'],
        queryFn: async () => {
            const response = await roleService.getAll({ limit: 100 });
            return response.data || [];
        },
        enabled: open,
        staleTime: 1000 * 60 * 5, // 5 minutes - roles don't change frequently
        gcTime: 1000 * 60 * 15, // 15 minutes
    });

    useEffect(() => {
        if (isError) {
             toast.error(error?.message || "Failed to load roles");
        }
    }, [isError, error]);

    useEffect(() => {
        if (open) {
            setSelectedRoleIds(currentRoleIds);
        }
    }, [open, currentRoleIds]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await userService.assignRoles(userId, selectedRoleIds);
            toast.success("User roles updated successfully");
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to update user roles"));
        } finally {
            setSubmitting(false);
        }
    };

    const toggleRole = (roleId: string) => {
        // Only allow single role if that's the business rule, or multiple. 
        // Backend supports array of roles. Frontend can support multiple.
        setSelectedRoleIds(prev =>
            prev.includes(roleId)
                ? prev.filter(id => id !== roleId)
                : [...prev, roleId]
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage Roles for {userName}</DialogTitle>
                    <DialogDescription>
                        Select roles to assign to this user.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => { void handleSubmit(e); }} className="space-y-6">
                    <div className="space-y-4">
                        {loading ? (
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto border p-2 rounded">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center space-x-2 p-2">
                                        <Skeleton className="h-4 w-4 rounded" />
                                        <div className="flex-1 space-y-1">
                                            <Skeleton className="h-4 w-24" />
                                            <Skeleton className="h-3 w-48" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-[60vh] overflow-y-auto border p-2 rounded">
                                {roles.map((role: IRole) => (
                                    <div key={role._id} className="flex items-center space-x-2 p-2 hover:bg-muted rounded text-sm">
                                        <Checkbox
                                            id={role._id}
                                            checked={selectedRoleIds.includes(role._id)}
                                            onClick={() => { /* No handleSave function exists, assuming this was a placeholder or typo. */ toggleRole(role._id); }}
                                        />
                                        <Label htmlFor={role._id} className="flex-1 cursor-pointer">
                                            <div className="font-semibold">{role.name}</div>
                                            <div className="text-muted-foreground text-xs">{role.description}</div>
                                        </Label>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="gradient" disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
