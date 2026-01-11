import React, { useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { roleService } from '@/lib/api/services/roleService';
import { Loader2 } from "lucide-react";
import { IPermission } from '@/types/api';
import { getErrorMessage } from '@/lib/errorUtils';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from "@/components/ui/skeleton";

const roleSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    permissionIds: z.array(z.string()),
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    roleId?: string; // If present, edit mode
    initialData?: {
        name: string;
        description: string;
        permissions: string[]; // IDs
    };
    onSuccess: () => void;
}


export const RoleFormDialog: React.FC<RoleFormDialogProps> = ({
    open,
    onOpenChange,
    roleId,
    initialData,
    onSuccess,
}) => {
    // Use React Query for permissions with caching
    const { data: permissions = [], isLoading: loadingPermissions, isError, error } = useQuery({
        queryKey: ['permissions'],
        queryFn: async () => {
            return await roleService.getPermissions();
        },
        enabled: open,
        staleTime: 1000 * 60 * 10, // 10 minutes - permissions rarely change
        gcTime: 1000 * 60 * 30, // 30 minutes
    });

    useEffect(() => {
        if (isError) {
             toast.error(error?.message || "Failed to load permissions");
        }
    }, [isError, error]);

    const form = useForm<RoleFormValues>({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            name: "",
            description: "",
            permissionIds: [],
        },
    });

    useEffect(() => {
        if (open) {
            if (initialData) {
                form.reset({
                    name: initialData.name,
                    description: initialData.description,
                    permissionIds: initialData.permissions,
                });
            } else {
                form.reset({
                    name: "",
                    description: "",
                    permissionIds: [],
                });
            }
        }
    }, [open, initialData, form]);

    const onSubmit = async (data: RoleFormValues) => {
        try {
            if (roleId) {
                await roleService.update(roleId, data);
                toast.success("Role updated successfully");
            } else {
                await roleService.create(data);
                toast.success("Role created successfully");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to save role"));
        }
    };

    // Group permissions by resource
    const groupedPermissions = permissions.reduce((acc: Record<string, IPermission[]>, perm: IPermission) => {
        if (!acc[perm.resource]) acc[perm.resource] = [];
        acc[perm.resource].push(perm);
        return acc;
    }, {} as Record<string, IPermission[]>);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{roleId ? "Edit Role" : "Create New Role"}</DialogTitle>
                    <DialogDescription>
                        Define the role name and assign permissions.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={(e) => { void form.handleSubmit(onSubmit)(e); }} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Role Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="e.g., Content Editor"
                                            {...field}
                                            disabled={roleId === 'admin' || roleId === 'user'}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Role description" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="permissionIds"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Permissions</FormLabel>
                                    {loadingPermissions ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded p-4">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className="space-y-2">
                                                    <Skeleton className="h-5 w-32" />
                                                    <Skeleton className="h-4 w-full" />
                                                    <Skeleton className="h-4 w-full" />
                                                    <Skeleton className="h-4 w-3/4" />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border rounded p-4">
                                            {Object.entries(groupedPermissions).map(([resource, perms]: [string, IPermission[]]) => (
                                                <div key={resource} className="space-y-2">
                                                    <h4 className="font-semibold capitalize text-sm border-b pb-1">{resource.replace('_', ' ')}</h4>
                                                    <div className="space-y-1">
                                                        {perms.map((perm) => (
                                                            <FormField
                                                                key={perm._id}
                                                                control={form.control}
                                                                name="permissionIds"
                                                                render={({ field }) => {
                                                                    return (
                                                                        <FormItem
                                                                            key={perm._id}
                                                                            className="flex flex-row items-center space-x-2 space-y-0"
                                                                        >
                                                                            <FormControl>
                                                                                <Checkbox
                                                                                    checked={field.value?.includes(perm._id)}
                                                                                    onCheckedChange={(checked) => {
                                                                                        return checked
                                                                                            ? field.onChange([...field.value, perm._id])
                                                                                            : field.onChange(
                                                                                                field.value?.filter(
                                                                                                    (value) => value !== perm._id
                                                                                                )
                                                                                            )
                                                                                    }}
                                                                                />
                                                                            </FormControl>
                                                                            <FormLabel className="text-xs font-normal cursor-pointer w-full">
                                                                                {perm.action} - {perm.description}
                                                                            </FormLabel>
                                                                        </FormItem>
                                                                    )
                                                                }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="gradient" disabled={form.formState.isSubmitting}>
                                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Role
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
