import React, { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Loader2, Send, User as UserIcon, Shield } from "lucide-react"
import { getErrorMessage } from "@/lib/errorUtils"
import { helpService } from "@/lib/api/services/helpService"
// import { IHelp } from "@/types/help" // Removed unused import
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { useEffect } from "react"

interface HelpDetailDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    ticketId: string | null
    onSuccess?: () => void // Refetch trigger for parent list
    isAdmin?: boolean
    canReply?: boolean
}

export function HelpDetailDialog({
    open,
    onOpenChange,
    ticketId,
    onSuccess,
    isAdmin = false,
    canReply = false
}: HelpDetailDialogProps) {
    const [replyContent, setReplyContent] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const { data: qData, isLoading, refetch, isError, error } = useQuery({
        queryKey: ["help-detail", ticketId, isAdmin],
        queryFn: async () => {
            if (!ticketId) return null;
            const res = isAdmin 
                ? await helpService.getByIdAdmin(ticketId)
                : await helpService.getById(ticketId);
            return res.help;
        },
        enabled: !!ticketId && open,
    });

    useEffect(() => {
        if (isError && open) {
            toast.error(getErrorMessage(error, "Failed to load ticket details"));
        }
    }, [isError, error, open]);

    const ticket = qData;

    const handleReply = async () => {
        if (!ticket || !replyContent.trim()) return

        setIsSubmitting(true)
        try {
            if (isAdmin) {
                await helpService.replyAdmin(ticket._id, { content: replyContent })
            } else {
                await helpService.reply(ticket._id, { content: replyContent })
            }
            toast.success("Reply sent successfully")
            setReplyContent("")
            await refetch(); // Refresh local discussion
            onSuccess?.() // Refresh parent list
        } catch (error) {
            console.error(error)
            toast.error(getErrorMessage(error, "Failed to send reply"))
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] h-[80vh] flex flex-col p-0">
                {!ticket || isLoading ? (
                    <div className="flex-1 flex flex-col p-6 space-y-6 overflow-hidden">
                        <div className="space-y-4">
                            <Skeleton className="h-8 w-3/4" />
                            <div className="flex gap-2">
                                <Skeleton className="h-5 w-20 rounded-full" />
                                <Skeleton className="h-5 w-40" />
                            </div>
                        </div>
                        <div className="flex-1 space-y-6">
                            <Skeleton className="h-24 w-full rounded-lg" />
                            <div className="space-y-4 pt-4">
                                <Skeleton className="h-20 w-[80%] rounded-lg" />
                                <Skeleton className="h-20 w-[80%] ml-auto rounded-lg" />
                                <Skeleton className="h-20 w-[70%] rounded-lg" />
                            </div>
                        </div>
                        <div className="space-y-3 pt-4 border-t">
                            <Skeleton className="h-20 w-full rounded-md" />
                            <div className="flex justify-end gap-2">
                                <Skeleton className="h-10 w-24" />
                                <Skeleton className="h-10 w-32" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <DialogHeader className="p-6 pb-2">
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1">
                                    <DialogTitle className="text-xl">{ticket.subject}</DialogTitle>
                                    <DialogDescription className="flex items-center gap-2">
                                        <Badge variant={ticket.status === 'resolved' ? 'success' : 'secondary'}>
                                            {ticket.status}
                                        </Badge>
                                        <span>•</span>
                                        <span>{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
                                        {isAdmin && typeof ticket.user_id !== 'string' && (
                                            <>
                                                <span>•</span>
                                                <span className="flex items-center gap-1 font-medium text-foreground">
                                                    <UserIcon className="w-3 h-3" />
                                                    {ticket.user_id.firstName} {ticket.user_id.lastName}
                                                </span>
                                            </>
                                        )}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <ScrollArea className="flex-1 p-6 pt-0">
                            <div className="space-y-6">
                                {/* Original Message */}
                                <div className="bg-muted/30 p-4 rounded-lg space-y-2 border">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                        <span className="font-semibold text-primary">Original Inquiry</span>
                                    </div>
                                    <p className="whitespace-pre-wrap text-sm">{ticket.body}</p>
                                </div>

                                {/* Thread */}
                                {ticket.messages.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <span className="w-full border-t" />
                                            </div>
                                            <div className="relative flex justify-center text-xs uppercase">
                                                <span className="bg-background px-2 text-muted-foreground">Discussion</span>
                                            </div>
                                        </div>
                                        
                                        {ticket.messages.map((msg, idx) => (
                                            <div
                                                key={idx}
                                                className={cn(
                                                    "flex flex-col gap-1 max-w-[85%] rounded-lg p-3 text-sm",
                                                    msg.role === 'admin' 
                                                        ? "ml-auto bg-primary/10 border border-primary/20" 
                                                        : "mr-auto bg-muted border"
                                                )}
                                            >
                                                <div className="flex items-center gap-2 text-xs opacity-70 mb-1">
                                                    <span className="font-semibold capitalize flex items-center gap-1">
                                                        {msg.role === 'admin' ? (
                                                            <><Shield className="w-3 h-3" /> Support</>
                                                        ) : (
                                                            <><UserIcon className="w-3 h-3" /> User</>
                                                        )}
                                                    </span>
                                                    <span>•</span>
                                                    <span>{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</span>
                                                </div>
                                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                
                                {ticket.messages.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground text-sm italic">
                                        No replies yet.
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        {/* Reply Area */}
                        <div className="p-6 pt-2 border-t bg-muted/10">
                            {canReply ? (
                                <div className="space-y-3">
                                    <Textarea
                                        placeholder="Type your reply..."
                                        value={replyContent}
                                        onChange={(e) => setReplyContent(e.target.value)}
                                        className="min-h-[80px] resize-none"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" onClick={() => onOpenChange(false)}>
                                            Close
                                        </Button>
                                        <Button 
                                            onClick={() => { void handleReply(); }} 
                                            disabled={!replyContent.trim() || isSubmitting}
                                            variant="gradient"
                                            className="gap-2"
                                        >
                                            {isSubmitting ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-4 h-4" />
                                            )}
                                            Send Reply
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex justify-end">
                                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                                        Close
                                    </Button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
