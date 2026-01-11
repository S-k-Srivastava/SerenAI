'use client';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from "@/components/ui/dialog" // Assuming you have/will create shadcn dialog
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import Link from "next/link"

interface ResourceViewerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    editUrl?: string; // If present, shows Edit button
    children: React.ReactNode;
}

export function ResourceViewer({
    isOpen,
    onClose,
    title,
    description,
    editUrl,
    children,
    resourceType // Accepted but optional if strictly typed in interface
}: ResourceViewerProps & { resourceType?: string }) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[750px] max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0 border-none shadow-2xl rounded-3xl">
                <DialogHeader className="px-8 py-8 border-b bg-muted/10">
                    <div className="flex items-center gap-3 mb-3">
                        {resourceType && (
                            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] uppercase font-bold tracking-widest border border-primary/20">
                                {resourceType}
                            </span>
                        )}
                        <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-tight">Resource Details</span>
                    </div>
                    <DialogTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {title}
                    </DialogTitle>
                    {description && (
                        <DialogDescription className="text-base text-muted-foreground mt-2 leading-relaxed">
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-8 py-8 scrollbar-thin scrollbar-thumb-muted-foreground/10 hover:scrollbar-thumb-muted-foreground/20">
                    {children}
                </div>

                <DialogFooter className="px-8 py-6 border-t bg-muted/5 gap-3 sm:gap-4 flex items-center justify-end">
                    <Button variant="ghost" onClick={onClose} className="hover:bg-muted/20">
                        Close
                    </Button>
                    {editUrl && (
                        <Link href={editUrl} onClick={onClose}>
                            <Button className="gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98] h-11 px-6">
                                <Pencil className="w-4 h-4" />
                                Edit {resourceType}
                            </Button>
                        </Link>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
