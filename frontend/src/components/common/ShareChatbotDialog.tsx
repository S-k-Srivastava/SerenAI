'use client';

import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Plus, Users, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { chatbotService } from '@/lib/api/services/chatbotService';
import { getErrorMessage } from '@/lib/errorUtils';
import { Badge } from '@/components/ui/badge';

interface ShareChatbotDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    chatbotId: string | null;
    chatbotName: string;
}

export function ShareChatbotDialog({ open, onOpenChange, chatbotId, chatbotName }: ShareChatbotDialogProps) {
    const [email, setEmail] = useState('');
    const [emails, setEmails] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const addEmail = () => {
        const trimmed = email.trim().toLowerCase();
        if (!trimmed) return;
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            toast.error("Invalid email address");
            return;
        }
        if (emails.includes(trimmed)) {
            toast.error("Email already added");
            return;
        }
        setEmails([...emails, trimmed]);
        setEmail('');
    };

    const removeEmail = (index: number) => {
        setEmails(emails.filter((_, i) => i !== index));
    };

    const handleShare = async () => {
        if (emails.length === 0) {
            toast.error("Please add at least one email");
            return;
        }

        if (!chatbotId) return;

        setLoading(true);
        try {
            await chatbotService.share(chatbotId, emails);
            toast.success(`Successfully shared "${chatbotName}"`);

            setTimeout(() => {
                onOpenChange(false);
                reset();
            }, 2000);
        } catch (error) {
            toast.error(getErrorMessage(error, "Failed to share chatbot"));
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setEmail('');
        setEmails([]);
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            onOpenChange(val);
            if (!val) reset();
        }}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Share Chatbot
                    </DialogTitle>
                    <DialogDescription>
                        Give other users access to &quot;{chatbotName}&quot;.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Enter email address..."
                                className="pl-10"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
                            />
                        </div>
                        <Button type="button" variant="secondary" onClick={addEmail}>
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="min-h-[60px] flex flex-wrap gap-2 p-2 border rounded-lg bg-muted/5">
                        {emails.length === 0 && (
                            <p className="text-xs text-muted-foreground italic p-1">No emails added yet...</p>
                        )}
                        {emails.map((e, i) => (
                            <Badge key={i} variant="secondary" className="pl-2 pr-1 py-1 gap-1 h-7">
                                {e}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeEmail(i)}
                                    className="h-4 w-4 ml-1 hover:bg-destructive/20 hover:text-destructive rounded-full p-0.5 transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </Badge>
                        ))}
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={() => { void handleShare(); }} disabled={loading || emails.length === 0} className="min-w-[100px]">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Users className="w-4 h-4 mr-2" />}
                        Share
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
