"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useMutation } from "@tanstack/react-query"
import { toast } from "sonner"
import { contactUsService } from "@/lib/api/services/contactUsService"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Mail, MessageSquare, Send } from "lucide-react"

const contactFormSchema = z.object({
    subject: z.string().min(1, "Subject is required").max(200, "Subject cannot exceed 200 characters"),
    email: z.string().email("Please provide a valid email"),
    body: z.string().min(1, "Message is required").max(2000, "Message cannot exceed 2000 characters"),
})

type ContactFormValues = z.infer<typeof contactFormSchema>

export function Contact() {
    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            subject: "",
            email: "",
            body: "",
        },
    })

    const createMutation = useMutation({
        mutationFn: contactUsService.create,
        onSuccess: () => {
            toast.success("Thank you for contacting us! We'll get back to you soon.")
            form.reset()
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to submit contact form")
        },
    })

    const onSubmit = (data: ContactFormValues) => {
        createMutation.mutate(data)
    }

    return (
        <section id="contact" className="py-24 bg-muted/30">
            <div className="container px-4 md:px-6 max-w-4xl">
                <div className="mb-12 text-center space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                        Get in Touch
                    </h2>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Have a question or feedback? We&apos;d love to hear from you. Fill out the form below and we&apos;ll be in touch.
                    </p>
                </div>

                <Card className="border-muted/40 shadow-sm">
                    <CardHeader className="pb-4 border-b bg-muted/5">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-primary" />
                            Send us a message
                        </CardTitle>
                        <CardDescription>
                            We typically respond within 24 hours.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Form {...form}>
                            <form onSubmit={(e) => { void form.handleSubmit(onSubmit)(e); }} className="space-y-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <FormField
                                        control={form.control}
                                        name="subject"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="flex items-center gap-2">
                                                    Subject <span className="text-destructive">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        placeholder="What is this regarding?"
                                                        {...field}
                                                        disabled={createMutation.isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="flex items-center gap-2">
                                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                                    Email <span className="text-destructive">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Input
                                                        type="email"
                                                        placeholder="your.email@example.com"
                                                        {...field}
                                                        disabled={createMutation.isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="body"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel className="flex items-center gap-2">
                                                    Message <span className="text-destructive">*</span>
                                                </FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Tell us more about your question or feedback..."
                                                        className="min-h-[150px] resize-none"
                                                        {...field}
                                                        disabled={createMutation.isPending}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="flex justify-end pt-2">
                                    <Button
                                        type="submit"
                                        variant="gradient"
                                        size="lg"
                                        disabled={createMutation.isPending}
                                        className="min-w-[140px]"
                                    >
                                        {createMutation.isPending ? (
                                            "Sending..."
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4 mr-2" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </section>
    )
}
