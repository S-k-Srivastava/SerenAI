import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PermissionGuard } from '@/components/auth/PermissionGuard';

export interface QuickActionCardProps {
    href: string;
    title: string;
    description: string;
    icon: LucideIcon;
    iconBg?: string; // e.g. "bg-primary/10"
    iconColor?: string; // e.g. "text-primary"
    hoverBorderColor?: string; // e.g. "hover:border-primary/30"
    permission?: string;
}

export function QuickActionCard({
    href,
    title,
    description,
    icon: Icon,
    iconBg = "bg-primary/10",
    iconColor = "text-primary",
    hoverBorderColor = "hover:border-primary/30",
    permission
}: QuickActionCardProps) {
    const cardContent = (
        <Link href={href} className="group h-full block">
            <Card className={cn(
                "hover:shadow-lg transition-all duration-300 cursor-pointer h-full border-border/50",
                hoverBorderColor
            )}>
                <CardContent className="p-6 flex items-center gap-4 h-full">
                    <div className={cn("p-3 rounded-xl group-hover:scale-110 transition-transform duration-300", iconBg)}>
                        <Icon className={cn("h-6 w-6", iconColor)} />
                    </div>
                    <div className="flex-1">
                        <h3 className={cn("font-semibold text-base mb-0.5 transition-colors", iconColor.replace("text-", "group-hover:text-"))}>
                            {title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <ArrowRight className={cn(
                        "h-5 w-5 text-muted-foreground transition-all group-hover:translate-x-1",
                        iconColor.replace("text-", "group-hover:text-")
                    )} />
                </CardContent>
            </Card>
        </Link>
    );

    if (permission) {
        return (
            <PermissionGuard permission={permission}>
                {cardContent}
            </PermissionGuard>
        );
    }

    return cardContent;
}
