import React from 'react';
import { cn } from '@/lib/utils';

interface ResourceGridProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    count: number;
}

export function ResourceGrid({ children, count, className, ...props }: ResourceGridProps) {
    const getGridClass = (count: number) => {
        if (count === 1) return "grid gap-3 md:gap-4 grid-cols-1";
        if (count === 2) return "grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2";
        return "grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    };

    return (
        <div className={cn(getGridClass(count), className)} {...props}>
            {children}
        </div>
    );
}
