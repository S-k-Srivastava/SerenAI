'use client';

import React, { useState, useRef, ReactNode } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export interface Column<T> {
    header: string;
    accessorKey?: keyof T | string;
    cell?: (row: T) => ReactNode;
    width?: number;
    minWidth?: number;
    align?: 'left' | 'center' | 'right';
}

interface ResourceTableProps<T> {
    data: T[];
    columns: Column<T>[];
    onRowClick?: (row: T) => void;
    className?: string;
}

export function ResourceTable<T extends { _id?: string | number }>({
    data,
    columns,
    onRowClick,
    className
}: ResourceTableProps<T>) {
    const [columnWidths, setColumnWidths] = useState<number[]>(() => {
        return columns.map(c => c.width || 200);
    });
    const [resizingColumnIndex, setResizingColumnIndex] = useState<number | null>(null);
    const tableRef = useRef<HTMLTableElement>(null);
    const startX = useRef<number>(0);
    const startWidth = useRef<number>(0);

    // Initial width sync is handled by useState initializer.
    // If columns change dynamically after mount, we might need synchronization,
    // but we must avoid cascading renders during the initial render.
    const newWidths = columns.map(c => c.width || 200);
    if (newWidths.length !== columnWidths.length) {
        setColumnWidths(newWidths);
    }

    const handleMouseDown = (index: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setResizingColumnIndex(index);
        startX.current = e.pageX;
        startWidth.current = columnWidths[index];

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (resizingColumnIndex === null) return;

        const delta = e.pageX - startX.current;
        const newWidths = [...columnWidths];
        const minWidth = columns[resizingColumnIndex].minWidth || 80;
        newWidths[resizingColumnIndex] = Math.max(minWidth, startWidth.current + delta);
        setColumnWidths(newWidths);
    };

    const handleMouseUp = () => {
        setResizingColumnIndex(null);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };

    return (
        <div className={cn("rounded-lg border border-primary/10 overflow-hidden bg-card/40 backdrop-blur-md shadow-sm", className)}>
            <div className="overflow-x-auto">
                <Table ref={tableRef} className="table-fixed w-full border-collapse">
                    <TableHeader className="bg-muted/30">
                        <TableRow className="hover:bg-transparent border-b border-primary/10">
                            {columns.map((column, index) => (
                                <TableHead
                                    key={index}
                                    style={{ width: columnWidths[index] || column.width || 'auto' }}
                                    className={cn(
                                        "relative group px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground select-none border-r border-primary/5 last:border-r-0",
                                        column.align === 'center' ? "text-center" : column.align === 'right' ? "text-right" : "text-left"
                                    )}
                                >
                                    <div className="truncate">{column.header}</div>

                                    {/* Resize handle */}
                                    <div
                                        onMouseDown={(e) => handleMouseDown(index, e)}
                                        className={cn(
                                            "absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/20 transition-colors z-10",
                                            resizingColumnIndex === index ? "bg-primary/40" : "bg-transparent"
                                        )}
                                    />
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {data.map((row, rowIndex) => (
                            <TableRow
                                key={row._id || rowIndex}
                                onClick={() => onRowClick?.(row)}
                                className={cn(
                                    "transition-colors border-b border-primary/5 last:border-0 group",
                                    onRowClick ? "cursor-pointer hover:bg-primary/[0.02]" : "hover:bg-transparent"
                                )}
                            >
                                {columns.map((column, colIndex) => (
                                    <TableCell
                                        key={colIndex}
                                        className={cn(
                                            "px-4 py-3 text-sm truncate border-r border-primary/5 last:border-r-0",
                                            column.align === 'center' ? "text-center" : column.align === 'right' ? "text-right" : "text-left"
                                        )}
                                        style={{ width: columnWidths[colIndex] }}
                                    >
                                        <div className={cn(
                                            "flex items-center w-full",
                                            column.align === 'center' ? "justify-center" : column.align === 'right' ? "justify-end" : "justify-start"
                                        )}>
                                            {column.cell ? column.cell(row) : (column.accessorKey ? String(row[column.accessorKey as keyof T] ?? '') : '')}
                                        </div>
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {data.length === 0 && (
                <div className="py-20 text-center text-muted-foreground text-sm italic border-t border-primary/5">
                    No items to display
                </div>
            )}
        </div>
    );
}
