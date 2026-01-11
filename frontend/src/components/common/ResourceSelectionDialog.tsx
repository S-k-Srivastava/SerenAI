'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, ChevronLeft, ChevronRight, Inbox, Check } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from "@/lib/utils";
import { IPaginatedResult } from "@/types/common";
import { ResourceGrid } from "@/components/common/ResourceGrid";

interface ResourceSelectionDialogProps<T> {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    searchPlaceholder?: string;
    
    // Data fetching
    fetchItems: (params: { search?: string; page?: number; limit?: number }) => Promise<IPaginatedResult<T>>;
    queryKeyPrefix: string;
    
    // Rendering
    renderItem: (item: T, isSelected: boolean, toggleSelection: () => void) => React.ReactNode;
    
    // Selection
    multiSelect?: boolean;
    initialSelectedIds?: string[];
    onConfirm: (selectedItems: T[]) => void;
    confirmLabel?: string;
}

export function ResourceSelectionDialog<T extends { _id: string }>({
    open,
    onOpenChange,
    title,
    description,
    searchPlaceholder = "Search...",
    fetchItems,
    queryKeyPrefix,
    renderItem,
    multiSelect = false,
    initialSelectedIds = [],
    onConfirm,
    confirmLabel = "Select"
}: ResourceSelectionDialogProps<T>) {
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState(search);
    const [page, setPage] = useState(1);
    const limit = 10;

    // Local selection state
    const [selectedItems, setSelectedItems] = useState<T[]>([]);
    // Use a map/set for quick lookups
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelectedIds));

    // Fix: Use JSON.stringify(initialSelectedIds) to prevent infinite loop and sync issues
    const initialIdsString = JSON.stringify(initialSelectedIds);
    useEffect(() => {
        // Only update if actually changed to avoid "setState in effect" warnings/loops
        setSelectedIds(prev => {
            const next = new Set(initialSelectedIds);
            if (prev.size !== next.size) return next;
            for (const id of next) if (!prev.has(id)) return next;
            return prev;
        });
        // We depend on the stringified version to react to prop changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialIdsString]);

    const { data: queryData, isLoading, isFetching, isError, error } = useQuery({
        queryKey: [queryKeyPrefix, debouncedSearch, page],
        queryFn: async () => {
            return await fetchItems({
                search: debouncedSearch,
                page,
                limit
            });
        },
        enabled: open,
        staleTime: 1000 * 60 * 3, // 3 minutes
        gcTime: 1000 * 60 * 15, // 15 minutes
    });

    useEffect(() => {
        if (isError) {
            toast.error(error?.message || "Failed to fetch items");
        }
    }, [isError, error]);

    const items = queryData?.data || [];
    const totalCount = queryData?.pagination?.total || 0;
    const totalPages = queryData?.pagination?.totalPages || Math.ceil(totalCount / limit);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [search]);

    const handleToggle = (item: T) => {
        const newSelectedIds = new Set(selectedIds);
        const newSelectedItems = [...selectedItems];

        if (newSelectedIds.has(item._id)) {
            newSelectedIds.delete(item._id);
            // Remove from items list if present
            const idx = newSelectedItems.findIndex(i => i._id === item._id);
            if (idx !== -1) newSelectedItems.splice(idx, 1);
        } else {
            if (!multiSelect) {
                newSelectedIds.clear();
                newSelectedItems.length = 0;
            }
            newSelectedIds.add(item._id);
            newSelectedItems.push(item);
        }

        setSelectedIds(newSelectedIds);
        setSelectedItems(newSelectedItems);
    };

    const handleConfirm = () => {
        onConfirm(selectedItems);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[900px] p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 pb-4 border-b relative z-40 bg-background">
                    <div className="flex items-center gap-2">
                        <DialogTitle className="text-xl">{title}</DialogTitle>
                        {totalCount > 0 && (
                            <Badge 
                                variant="secondary" 
                                className="px-2 py-0.5 text-xs font-semibold bg-primary/10 text-primary border-primary/20"
                            >
                                {totalCount}
                            </Badge>
                        )}
                    </div>
                    {description && (
                        <DialogDescription>
                            {description}
                        </DialogDescription>
                    )}
                </DialogHeader>

                <div className="p-4 border-b bg-background relative z-40">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={searchPlaceholder}
                            className="pl-10 h-10"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <ScrollArea className="h-[600px] px-4 py-2">
                    {isLoading && page === 1 ? (
                        <ResourceGrid 
                            count={6} 
                            className="grid-cols-1 md:grid-cols-2 lg:grid-cols-2 pt-4"
                        >
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="border rounded-xl p-5 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-10 w-10 rounded-lg" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-5 w-32" />
                                                <Skeleton className="h-3 w-48" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 pt-2">
                                        <Skeleton className="h-8 w-full rounded-md" />
                                        <Skeleton className="h-8 w-full rounded-md" />
                                        <Skeleton className="h-8 w-full rounded-md" />
                                    </div>
                                </div>
                            ))}
                        </ResourceGrid>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Inbox className="h-12 w-12 text-muted-foreground/20 mb-3" />
                            <p className="text-sm font-medium">No items found</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Try a different search term
                            </p>
                        </div>
                    ) : (
                        <ResourceGrid 
                            count={items.length} 
                            className="grid-cols-1 md:grid-cols-2 lg:grid-cols-2 pt-4" // Explicitly requested 2 columns on lg
                        >
                            {items.map((item) => (
                                <React.Fragment key={item._id}>
                                    {renderItem(
                                        item,
                                        selectedIds.has(item._id),
                                        () => handleToggle(item)
                                    )}
                                </React.Fragment>
                            ))}
                        </ResourceGrid>
                    )}
                    
                    {isFetching && page > 1 && (
                        <div className="py-4 flex justify-center">
                            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        </div>
                    )}
                </ScrollArea>

                <div className="p-4 border-t bg-background flex items-center justify-between relative z-40">
                     {/* Pagination Controls */}
                     <div className="flex items-center gap-2">
                        <Button
                            variant="outline-premium"
                            size="icon"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1 || isFetching}
                            className="h-8 w-8"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs text-muted-foreground">
                            Page {page} of {totalPages || 1}
                        </span>
                        <Button
                            variant="outline-premium"
                            size="icon"
                            onClick={() => setPage(p => Math.min(totalPages || 1, p + 1))}
                            disabled={page === totalPages || isFetching || totalPages === 0}
                            className="h-8 w-8"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="ghost-premium" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleConfirm} disabled={selectedIds.size === 0} variant="gradient">
                            {confirmLabel} 
                            {selectedIds.size > 0 && ` (${selectedIds.size})`}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// Fallback or helper for Document row
export function DocumentSelectionRow({ 
    document, 
    isSelected, 
    onToggle 
}: { 
    document: { _id: string; name: string; size?: number }; 
    isSelected: boolean; 
    onToggle: () => void; 
}) {
    return (
        <div
            onClick={onToggle}
            className={cn(
                "flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all",
                isSelected 
                    ? "border-primary bg-primary/5 shadow-sm" 
                    : "border-muted/40 hover:bg-muted/5 hover:border-primary/20"
            )}
        >
            <div className="flex items-center gap-3">
                <div className={cn(
                    "w-5 h-5 rounded-md border flex items-center justify-center transition-colors",
                    isSelected ? "bg-primary border-primary" : "border-muted-foreground/30"
                )}>
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{document.name}</span>
                    {document.size && (
                        <span className="text-[10px] text-muted-foreground">
                            {(document.size / 1024).toFixed(1)} KB
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
