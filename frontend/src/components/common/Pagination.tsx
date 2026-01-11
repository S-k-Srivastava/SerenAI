'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
    maxVisiblePages?: number;
    totalItems?: number;
}

export function Pagination({
    currentPage,
    totalPages,
    onPageChange,
    isLoading = false,
    maxVisiblePages = 7,
    totalItems
}: PaginationProps) {
    if (totalPages <= 0 && typeof totalItems !== 'number') return null;

    // Calculate page range to display
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= maxVisiblePages) {
            // Show all pages if total is less than max
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        // Always show first page
        pages.push(1);

        // Calculate start and end of middle range
        let start = Math.max(2, currentPage - 1);
        let end = Math.min(totalPages - 1, currentPage + 1);

        // Adjust range if near start
        if (currentPage <= 3) {
            end = Math.min(5, totalPages - 1);
        }

        // Adjust range if near end
        if (currentPage >= totalPages - 2) {
            start = Math.max(2, totalPages - 4);
        }

        // Add ellipsis if needed before middle range
        if (start > 2) {
            pages.push('...');
        }

        // Add middle range
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        // Add ellipsis if needed after middle range
        if (end < totalPages - 1) {
            pages.push('...');
        }

        // Always show last page
        if (totalPages > 1) {
            pages.push(totalPages);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="flex items-center justify-between sm:justify-end w-full gap-4 animate-fade-in">
            {/* Total items count - Hidden on mobile */}
            {typeof totalItems === 'number' && (
                <div className="hidden lg:flex items-center text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">{totalItems}</span>
                    <span className="ml-1">items total</span>
                </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
                {/* First Page Button - Desktop only */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(1)}
                    disabled={currentPage === 1 || isLoading}
                    className={cn(
                        "hidden lg:flex h-9 w-9 p-0",
                        "bg-card hover:bg-card-hover",
                        "border-border/50 hover:border-primary/50",
                        "transition-all duration-200",
                        "rounded-lg"
                    )}
                    title="First page"
                >
                    <ChevronsLeft className="h-4 w-4" />
                </Button>

                {/* Previous Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || isLoading}
                    className={cn(
                        "h-9 px-3",
                        "bg-card hover:bg-card-hover",
                        "border-border/50 hover:border-primary/50",
                        "transition-all duration-200",
                        "rounded-lg gap-2"
                    )}
                >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm">Previous</span>
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center gap-1">
                    {/* Desktop/Tablet View: Full page numbers */}
                    <div className="hidden md:flex items-center gap-1">
                        {pageNumbers.map((page, idx) => {
                            if (page === '...') {
                                return (
                                    <span
                                        key={`ellipsis-${idx}`}
                                        className="h-9 w-9 flex items-center justify-center text-muted-foreground text-sm"
                                    >
                                        ...
                                    </span>
                                );
                            }

                            const isCurrentPage = currentPage === page;

                            return (
                                <Button
                                    key={page}
                                    variant={isCurrentPage ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onPageChange(page as number)}
                                    disabled={isLoading}
                                    className={cn(
                                        "h-9 w-9 p-0 rounded-lg transition-all duration-300 text-sm font-medium",
                                        isCurrentPage
                                            ? "shadow-lg shadow-primary/20 scale-110 hover:scale-110"
                                            : "bg-card hover:bg-card-hover border-border/50 hover:border-primary/50 hover:text-primary"
                                    )}
                                >
                                    {page}
                                </Button>
                            );
                        })}
                    </div>

                    {/* Mobile View: Compact Indicator */}
                    <div className={cn(
                        "flex md:hidden items-center justify-center",
                        "px-4 h-9 rounded-lg",
                        "bg-card border border-border/50",
                        "text-sm font-medium"
                    )}>
                        <span className="text-foreground">{currentPage}</span>
                        <span className="text-muted-foreground mx-1">/</span>
                        <span className="text-muted-foreground">{totalPages}</span>
                    </div>
                </div>

                {/* Next Button */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || isLoading}
                    className={cn(
                        "h-9 px-3",
                        "bg-card hover:bg-card-hover",
                        "border-border/50 hover:border-primary/50",
                        "transition-all duration-200",
                        "rounded-lg gap-2"
                    )}
                >
                    <span className="hidden sm:inline text-sm">Next</span>
                    <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Last Page Button - Desktop only */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange(totalPages)}
                    disabled={currentPage === totalPages || isLoading}
                    className={cn(
                        "hidden lg:flex h-9 w-9 p-0",
                        "bg-card hover:bg-card-hover",
                        "border-border/50 hover:border-primary/50",
                        "transition-all duration-200",
                        "rounded-lg"
                    )}
                    title="Last page"
                >
                    <ChevronsRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
