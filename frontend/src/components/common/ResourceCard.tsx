'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, LucideIcon, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

/**
 * Meta information item to display in the resource card
 */
export interface MetaItem {
    icon: LucideIcon;
    label: string | number | React.ReactNode;
    title?: string;
    className?: string;
}

/**
 * Action item for the dropdown menu
 */
export interface ActionItem {
    label: string;
    icon?: LucideIcon;
    onClick: () => void;
    variant?: 'default' | 'destructive';
    disabled?: boolean;
}

/**
 * Status badge configuration
 */
export interface StatusConfig {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
    className?: string;
}

/**
 * Accent color configuration for the card
 */
export type AccentColor = 'primary' | 'success' | 'warning' | 'destructive' | 'info';

/**
 * Props for the ResourceCard component
 */
export interface ResourceCardProps {
    title: string;
    icon: LucideIcon;
    iconClassName?: string;
    accentColor?: AccentColor;
    status?: StatusConfig;
    suffix?: React.ReactNode;
    metaItems?: MetaItem[];
    footer?: React.ReactNode;
    actions?: ActionItem[];
    primaryAction?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    children?: React.ReactNode;
    subtitle1?: string;
    subtitle2?: string;
}

const getAccentColorClasses = (color: AccentColor): { bg: string; text: string; border: string; glow: string; hoverBg: string } => {
    const colorMap: Record<AccentColor, { bg: string; text: string; border: string; glow: string; hoverBg: string }> = {
        primary: {
            bg: 'bg-primary/10',
            text: 'text-primary',
            border: 'group-hover:border-primary/50',
            glow: 'group-hover:shadow-primary/5',
            hoverBg: 'group-hover:bg-primary/5',
        },
        success: {
            bg: 'bg-green-500/10',
            text: 'text-green-600 dark:text-green-400',
            border: 'group-hover:border-green-500/50',
            glow: 'group-hover:shadow-green-500/5',
            hoverBg: 'group-hover:bg-green-500/5',
        },
        warning: {
            bg: 'bg-yellow-500/10',
            text: 'text-yellow-600 dark:text-yellow-400',
            border: 'group-hover:border-yellow-500/50',
            glow: 'group-hover:shadow-yellow-500/5',
            hoverBg: 'group-hover:bg-yellow-500/5',
        },
        destructive: {
            bg: 'bg-red-500/10',
            text: 'text-red-600 dark:text-red-400',
            border: 'group-hover:border-red-500/50',
            glow: 'group-hover:shadow-red-500/5',
            hoverBg: 'group-hover:bg-red-500/5',
        },
        info: {
            bg: 'bg-primary/10',
            text: 'text-primary',
            border: 'group-hover:border-primary/50',
            glow: 'group-hover:shadow-primary/5',
            hoverBg: 'group-hover:bg-primary/5',
        },
    };
    return colorMap[color];
};

export function ResourceCard({
    title,
    icon: Icon,
    iconClassName,
    accentColor = 'primary',
    status,
    metaItems = [],
    actions,
    onClick,
    className,
    children,
    subtitle1,
}: ResourceCardProps) {
    const accent = getAccentColorClasses(accentColor);

    return (
        <Card
            className={cn(
                'group relative overflow-hidden',
                // Primary tint background
                'bg-primary/[0.02] dark:bg-primary/[0.015]',
                'border border-border/40 hover:border-primary/20',
                'rounded-xl',
                // Transitions
                'transition-all duration-300 ease-out',
                // Hover
                'hover:shadow-lg hover:shadow-primary/5',
                onClick && 'cursor-pointer',
                className
            )}
            onClick={onClick}
        >
            {/* Top section - Icon + Title + Actions */}
            <div className="px-3.5 pt-3.5 pb-2.5">
                <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className="relative">
                        <div className={cn(
                            'absolute inset-0 rounded-lg blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-400',
                            accent.bg
                        )} />
                        <div
                            className={cn(
                                'relative h-9 w-9 rounded-lg flex items-center justify-center',
                                'transition-all duration-300',
                                'group-hover:scale-110',
                                accent.bg,
                                accent.text,
                                iconClassName
                            )}
                        >
                            <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} />
                        </div>
                    </div>

                    {/* Title + Actions */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-[13px] text-foreground truncate leading-tight">
                                {title}
                            </h3>

                            {/* Actions row */}
                            <div className="flex items-center shrink-0 -mr-1">
                                {onClick && (
                                    <div className={cn(
                                        'p-1 rounded-md opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100',
                                        'transition-all duration-200',
                                        accent.text
                                    )}>
                                        <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                                    </div>
                                )}

                                {actions && actions.length > 0 && (
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={cn(
                                                        'h-7 w-7 rounded-md',
                                                        'text-muted-foreground/40 hover:text-foreground hover:bg-primary/10',
                                                        'opacity-0 group-hover:opacity-100',
                                                        'transition-all duration-200'
                                                    )}
                                                >
                                                    <MoreHorizontal className="h-4 w-4" strokeWidth={2} />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent 
                                                align="end" 
                                                className="w-40 rounded-xl"
                                            >
                                                {actions.map((action, idx) => (
                                                    <DropdownMenuItem
                                                        key={idx}
                                                        onClick={action.onClick}
                                                        disabled={action.disabled}
                                                        className={cn(
                                                            'cursor-pointer rounded-lg text-xs',
                                                            action.variant === 'destructive' && 'text-destructive focus:text-destructive'
                                                        )}
                                                    >
                                                        {action.icon && <action.icon className="mr-2 h-3.5 w-3.5" strokeWidth={1.75} />}
                                                        {action.label}
                                                    </DropdownMenuItem>
                                                ))}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Subtitle - clearly separated */}
                        {subtitle1 && (
                            <p className="text-[11px] text-muted-foreground/60 line-clamp-1 mt-0.5">
                                {subtitle1}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Children */}
            {children && (
                <div className="px-3.5 pb-2.5">
                    {children}
                </div>
            )}

            {/* Bottom section - Meta + Status - visually separated */}
            {(metaItems.length > 0 || status) && (
                <div className={cn(
                    'px-3.5 py-2 mt-0.5',
                    'bg-muted/30 dark:bg-muted/20',
                    'border-t border-border/30',
                    'flex items-center justify-between gap-3'
                )}>
                    {/* Meta items */}
                    <div className="flex items-center gap-3 min-w-0">
                        {metaItems.map((item, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    'flex items-center gap-1.5 text-[11px] text-muted-foreground/70',
                                    item.className
                                )}
                                title={item.title}
                            >
                                <item.icon className="w-3 h-3" strokeWidth={2} />
                                <span className="font-medium">{item.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Status badge */}
                    {status && (
                        <div className={cn(
                            'flex items-center gap-1.5 px-2 py-0.5 rounded-full shrink-0',
                            'text-[9px] font-bold uppercase tracking-wider',
                            status.label.toLowerCase() === 'active' 
                                ? 'bg-green-500/20 text-green-500' 
                                : 'bg-muted-foreground/10 text-muted-foreground/60',
                            status.className
                        )}>
                            {status.label.toLowerCase() === 'active' && (
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
                                </span>
                            )}
                            {status.label}
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}