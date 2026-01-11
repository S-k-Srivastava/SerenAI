import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getErrorMessage } from "@/lib/errorUtils"
import { roleService } from "@/lib/api/services/roleService"
import { userService } from "@/lib/api/services/userService"

const userSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    roleIds: z.array(z.string()).min(1, "At least one role is required"),
})

type UserFormValues = z.infer<typeof userSchema>

interface UserFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function UserFormDialog({
    open,
    onOpenChange,
    onSuccess
}: UserFormDialogProps) {
    const form = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            roleIds: [],
        },
    })

    const { data: roles = [], isLoading: isLoadingRoles, isError, error } = useQuery({
        queryKey: ['roles'],
        queryFn: async () => {
            const response = await roleService.getAll();
            return response.data;
        },
        enabled: open
    });

    useEffect(() => {
        if (isError) {
             toast.error(error?.message || "Failed to load roles");
        }
    }, [isError, error]);

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (!open) {
            form.reset({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                roleIds: [],
            })
        }
    }, [open, form])

    const onSubmit = async (data: UserFormValues) => {
        try {
            await userService.create({
                ...data,
                roles: data.roleIds
            })
            toast.success("User created successfully")
            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, "Failed to create user"))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                        Add a new user to the system and assign their initial roles.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={(e) => { void form.handleSubmit(onSubmit)(e); }} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="john.doe@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="roleIds"
                            render={() => (
                                <FormItem>
                                    <div className="mb-4">
                                        <FormLabel className="text-base">Roles</FormLabel>
                                        <p className="text-[0.8rem] text-muted-foreground">
                                            Select roles for this user.
                                        </p>
                                    </div>
                                    {isLoadingRoles ? (
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Loading roles...
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-2 max-h-[150px] overflow-y-auto p-1 border rounded-md">
                                            {roles.map((role) => (
                                                <FormField
                                                    key={role._id}
                                                    control={form.control}
                                                    name="roleIds"
                                                    render={({ field }) => {
                                                        return (
                                                            <FormItem
                                                                key={role._id}
                                                                className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-2 bg-card hover:bg-primary/10 transition-colors"
                                                            >
                                                                <FormControl>
                                                                    <Checkbox
                                                                        checked={field.value?.includes(role._id)}
                                                                        onClick={() => { void form.handleSubmit(onSubmit)(); }}
                                                                        onCheckedChange={(checked) => {
                                                                            return checked
                                                                                ? field.onChange([...field.value, role._id])
                                                                                : field.onChange(
                                                                                    field.value?.filter(
                                                                                        (value) => value !== role._id
                                                                                    )
                                                                                )
                                                                        }}
                                                                    />
                                                                </FormControl>
                                                                <Label className="font-normal cursor-pointer w-full" onClick={() => {
                                                                    const checked = field.value?.includes(role._id);
                                                                    if (checked) {
                                                                        field.onChange(field.value?.filter((v) => v !== role._id));
                                                                    } else {
                                                                        field.onChange([...field.value, role._id]);
                                                                    }
                                                                }}>
                                                                    {role.name}
                                                                </Label>
                                                            </FormItem>
                                                        )
                                                    }}
                                                />
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
                                {form.formState.isSubmitting && (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Create User
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
