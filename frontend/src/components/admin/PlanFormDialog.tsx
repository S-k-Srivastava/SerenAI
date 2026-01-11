import React, { useEffect } from "react"
import { useForm, Resolver } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "../ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Loader2, Plus, X } from "lucide-react"
import { getErrorMessage } from "@/lib/errorUtils"
import { planService } from "@/lib/api/services/planService"
import { IPlan } from "@/types/plan"

const planSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    price: z.coerce.number().min(0, "Price must be non-negative"),
    currency: z.string().default("INR"),
    duration: z.coerce.number().int().min(1, "Duration must be at least 1 day").default(30),
    discountPercentage: z.coerce.number().min(0).max(100).optional(),
    discountOfferTitle: z.string().optional(),
    max_chatbot_count: z.coerce.number().int().min(0, "Chatbot count cannot be negative"),
    max_chatbot_shares: z.coerce.number().int().min(0, "Share count cannot be negative"),
    max_document_count: z.coerce.number().int().min(0, "Document count cannot be negative"),
    max_word_count_per_document: z.coerce.number().int().min(0, "Word count limit cannot be negative"),
    is_public_chatbot_allowed: z.boolean().default(false),
    benefits: z.array(z.string().min(1, "Benefit cannot be empty")).min(1, "At least one benefit is required"),
})

type PlanFormValues = z.infer<typeof planSchema>

interface PlanFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    plan?: IPlan | null
}

export function PlanFormDialog({
    open,
    onOpenChange,
    onSuccess,
    plan
}: PlanFormDialogProps) {
    const isEditing = !!plan;

    const form = useForm<PlanFormValues>({
        resolver: zodResolver(planSchema) as unknown as Resolver<PlanFormValues>,
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            currency: "INR",
            duration: 30,
            discountPercentage: 0,
            discountOfferTitle: "",
            max_chatbot_count: 5,
            max_chatbot_shares: 0,
            max_document_count: 0,
            max_word_count_per_document: 5000,
            is_public_chatbot_allowed: false,
            benefits: [""],
        },
    })

    // Reset form when dialog opens/closes or plan changes
    useEffect(() => {
        if (open) {
            form.reset({
                name: plan ? plan.name : "",
                description: plan ? plan.description : "",
                price: plan ? plan.price : 0,
                currency: plan ? plan.currency : "INR",
                duration: plan ? plan.duration : 30,
                discountPercentage: plan ? plan.discountPercentage : 0,
                discountOfferTitle: plan ? plan.discountOfferTitle : "",
                max_chatbot_count: plan ? plan.max_chatbot_count : 5,
                max_chatbot_shares: plan ? plan.max_chatbot_shares : 0,
                max_document_count: plan ? plan.max_document_count : 0,
                max_word_count_per_document: plan ? plan.max_word_count_per_document : 5000,
                is_public_chatbot_allowed: plan ? plan.is_public_chatbot_allowed : false,
                benefits: (plan?.benefits && plan.benefits.length > 0) ? plan.benefits : [""],
            })
        }
    }, [open, plan, form])

    const onSubmit = async (data: PlanFormValues) => {
        try {
            if (isEditing && plan) {
                await planService.update(plan._id, data);
                toast.success("Plan updated successfully");
            } else {
                await planService.create(data);
                toast.success("Plan created successfully");
            }
            onOpenChange(false);
            onSuccess?.();
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, `Failed to ${isEditing ? 'update' : 'create'} plan`));
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Plan" : "Create New Plan"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Update plan details." : "Add a new plan to the system."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={(e) => { void form.handleSubmit(onSubmit)(e); }} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Plan Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Pro Plan" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price (in Rupees)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Best for small teams..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="duration"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duration (Days)</FormLabel>
                                    <FormControl>
                                        <Input type="number" min="1" placeholder="30" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="discountPercentage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discount (%)</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" max="100" placeholder="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="discountOfferTitle"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discount Title (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Limited Time Offer" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="max_chatbot_count"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Bots</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="max_document_count"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Docs</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="max_chatbot_shares"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Shares</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="max_word_count_per_document"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Max Words/Doc</FormLabel>
                                        <FormControl>
                                            <Input type="number" min="0" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="benefits"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center justify-between mb-2">
                                        <FormLabel>Plan Benefits</FormLabel>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-7 px-2 gap-1"
                                            onClick={() => {
                                                const current = field.value || [];
                                                field.onChange([...current, ""]);
                                            }}
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Add Benefit
                                        </Button>
                                    </div>
                                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2 custom-scrollbar">
                                        {(field.value || []).map((benefit: string, index: number) => (
                                            <div key={index} className="flex gap-2 items-center">
                                                <FormControl>
                                                    <Input
                                                        placeholder="e.g. 24/7 Support"
                                                        value={benefit}
                                                        onChange={(e) => {
                                                            const newValue = [...field.value];
                                                            newValue[index] = e.target.value;
                                                            field.onChange(newValue);
                                                        }}
                                                    />
                                                </FormControl>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                                    onClick={() => {
                                                        const newValue = field.value.filter((_: string, i: number) => i !== index);
                                                        field.onChange(newValue);
                                                    }}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                        {(field.value || []).length === 0 && (
                                            <div className="text-center py-4 border rounded-lg border-dashed bg-muted/20">
                                                <p className="text-xs text-muted-foreground italic">No benefits added yet.</p>
                                            </div>
                                        )}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="is_public_chatbot_allowed"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={(checked: boolean) => { void field.onChange(checked); }}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Allow Public Chatbots
                                        </FormLabel>
                                        <FormDescription>
                                            Users on this plan can make their chatbots public.
                                        </FormDescription>
                                    </div>
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
                                {isEditing ? "Update Plan" : "Create Plan"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
