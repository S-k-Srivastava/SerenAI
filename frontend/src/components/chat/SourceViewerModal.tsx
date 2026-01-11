'use client';

import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { IResolvedTheme } from '@/types/chatbot';

interface Source {
    content: string;
    metadata: {
        document_id?: string;
        [key: string]: unknown;
    };
}

interface SourceViewerModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    sources: Source[];
    theme: IResolvedTheme;
}

export function SourceViewerModal({ open, onOpenChange, sources, theme }: SourceViewerModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className="sm:max-w-[600px] max-h-[80vh] flex flex-col border"
                style={{
                    backgroundColor: theme.bg_color,
                    borderColor: theme.ai_bubble_border_color
                }}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2" style={{ color: theme.header_text_color }}>
                        <FileText className="w-5 h-5" style={{ color: theme.accent_color }} />
                        Retrieved Sources
                    </DialogTitle>
                    <DialogDescription style={{ color: theme.welcome_text_color }}>
                        The following document snippets were used to generate this response.
                    </DialogDescription>
                </DialogHeader>

                <div className="overflow-y-auto flex-1 pr-2">
                    <div className="space-y-4">
                        {sources.map((source, index) => (
                            <div
                                key={index}
                                className="p-4 rounded-xl border space-y-3"
                                style={{
                                    backgroundColor: theme.ai_bubble_color,
                                    borderColor: theme.ai_bubble_border_color
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    <span
                                        className="text-[10px] font-bold uppercase tracking-wider"
                                        style={{ color: theme.timestamp_color }}
                                    >
                                        Source #{index + 1}
                                    </span>
                                    {source.metadata?.document_id && (
                                        <Link href={`/documents/${source.metadata.document_id}?search=${encodeURIComponent(source.content.substring(0, 100))}`}>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-[10px] gap-1.5 px-2.5 transition-colors"
                                                style={{
                                                    backgroundColor: theme.ai_bubble_color,
                                                    borderColor: theme.ai_bubble_border_color,
                                                    color: theme.accent_color
                                                }}
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                                View Document
                                            </Button>
                                        </Link>
                                    )}
                                </div>
                                <p
                                    className="text-sm leading-relaxed italic"
                                    style={{ color: theme.ai_bubble_text_color }}
                                >
                                    &quot;{source.content}&quot;
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter className="mt-6">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
