import React from "react"
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
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { getErrorMessage } from "@/lib/errorUtils"
import { helpService } from "@/lib/api/services/helpService"

const helpSchema = z.object({
    subject: z.string().min(5, "Subject must be at least 5 characters").max(200, "Subject cannot exceed 200 characters"),
    body: z.string().min(10, "Description must be at least 10 characters").max(2000, "Description cannot exceed 2000 characters"),
})

type HelpFormValues = z.infer<typeof helpSchema>

interface HelpFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
    initialValues?: {
        subject?: string
        body?: string
    }
}

    export function HelpFormDialog({
    open,
    onOpenChange,
    onSuccess,
    initialValues
}: HelpFormDialogProps) {
    const form = useForm<HelpFormValues>({
        resolver: zodResolver(helpSchema),
        defaultValues: {
            subject: initialValues?.subject || "",
            body: initialValues?.body || "",
        },
    })

    // Reset form when dialog opens/closes
    React.useEffect(() => {
        if (open) {
            form.reset({
                subject: initialValues?.subject || "",
                body: initialValues?.body || "",
            })
        } else {
             form.reset({
                subject: "",
                body: "",
            })
        }
    }, [open, form, initialValues])

    const onSubmit = async (data: HelpFormValues) => {
        try {
            await helpService.create(data)
            toast.success("Ticket created successfully")
            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            console.error(error);
            toast.error(getErrorMessage(error, "Failed to create ticket"))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>New Support Ticket</DialogTitle>
                    <DialogDescription>
                        Submit a new help request. We&apos;ll get back to you as soon as possible. Please keep checking this help ticket for resolution.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={(e) => { void form.handleSubmit(onSubmit)(e); }} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Brief summary of the issue" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="body"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="Detailed description of the problem..." 
                                            className="min-h-[150px] resize-y" 
                                            {...field} 
                                        />
                                    </FormControl>
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
                                Submit Ticket
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
