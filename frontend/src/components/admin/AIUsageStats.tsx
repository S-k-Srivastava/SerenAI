"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Cpu, Sparkles, FileText, LucideIcon, Search } from "lucide-react";
import { DateRange as DateRangeType } from "react-day-picker";
import { DateRangePicker, Calendar as RDRCalendar } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import '@/styles/calendar.css';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

import { UsageEventGroup, AdminStats } from "@/types/admin";

interface AIUsageStatsProps {
    date: DateRangeType;
    onDateChange: (date: DateRangeType) => void;
    stats: AdminStats | undefined;
    isLoading: boolean;
    hideHeader?: boolean;
    hideDatePicker?: boolean;
}

const typeConfig: Record<string, { label: string; icon: LucideIcon; iconBg: string; iconColor: string; unit?: string }> = {
    "CREATE_DOCUMENT_INDEX": { 
        label: "Document Indexing", 
        icon: FileText, 
        iconBg: "bg-info/10", 
        iconColor: "text-info",
        unit: "Total Tokens"
    },
    "LLM_INPUT": { 
        label: "LLM Input Tokens", 
        icon: Cpu, 
        iconBg: "bg-warning/10", 
        iconColor: "text-warning",
        unit: "Total Tokens"
    },
    "LLM_OUTPUT": { 
        label: "LLM Output Tokens", 
        icon: Sparkles, 
        iconBg: "bg-success/10", 
        iconColor: "text-success",
        unit: "Total Tokens"
    },
    "QUERY_DOCUMENT": {
        label: "Documents Retrieved",
        icon: Search,
        iconBg: "bg-purple-500/10",
        iconColor: "text-purple-500",
        unit: "Total Tokens"
    }
};

export function AIUsageStats({ date, onDateChange, stats, isLoading, hideHeader = false, hideDatePicker = false }: AIUsageStatsProps) {
    const aiUsage = stats?.aiUsage || [];
    const [isMobile, setIsMobile] = useState(false);

    // Check if mobile on mount and resize
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 640);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Flatten all events from all groups with their event_type
    const allCards: Array<{ eventType: string; provider: string; modelName: string; totalTokens: number }> = [];
    aiUsage.forEach((group: UsageEventGroup) => {
        group.events.forEach((event: { provider: string; model_name: string; total_tokens: number }) => {
            allCards.push({
                eventType: group.event_type,
                provider: event.provider,
                modelName: event.model_name,
                totalTokens: event.total_tokens,
            });
        });
    });

    return (
        <div className="space-y-6">
            {!hideHeader && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div className="space-y-0.5">
                            <h2 className="text-xl md:text-2xl font-bold tracking-tight">AI Usage Monitoring</h2>
                            <p className="text-xs md:text-sm text-muted-foreground">Resource consumption across models and services.</p>
                        </div>
                    </div>

                    {!hideDatePicker && (
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full sm:w-[280px] justify-start text-left font-medium shadow-sm hover:shadow-md hover:border-primary/30 transition-all rounded-xl",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4 text-primary" />
                                    {date?.from ? (
                                        date.to ? (
                                            <span className="flex items-center gap-1.5 text-sm">
                                                <span className="font-semibold">{format(date.from, "MMM dd")}</span>
                                                <span className="text-muted-foreground text-xs">→</span>
                                                <span className="font-semibold">{format(date.to, "MMM dd, yyyy")}</span>
                                            </span>
                                        ) : (
                                            <span className="text-sm">
                                                <span className="font-semibold">{format(date.from, "MMM dd, yyyy")}</span>
                                                <span className="text-muted-foreground text-xs ml-1">(Select end date)</span>
                                            </span>
                                        )
                                    ) : (
                                        <span>Pick a date range</span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-[calc(100vw-2rem)] sm:w-auto p-0 border-border/50 shadow-2xl rounded-xl overflow-hidden"
                                align="end"
                                sideOffset={5}
                            >
                                <div className="date-range-picker-wrapper">
                                    {isMobile ? (
                                        <RDRCalendar
                                            date={date?.from || new Date()}
                                            onChange={(selectedDate: Date) => {
                                                // For mobile, use single calendar with smart range selection
                                                if (!date?.from || (date?.from && date?.to)) {
                                                    // Starting new range
                                                    onDateChange({
                                                        from: selectedDate,
                                                        to: undefined
                                                    });
                                                } else {
                                                    // Completing range
                                                    const start = date.from;
                                                    const end = selectedDate;
                                                    onDateChange({
                                                        from: start < end ? start : end,
                                                        to: start < end ? end : start
                                                    });
                                                }
                                            }}
                                            color="hsl(var(--primary))"
                                        />
                                    ) : (
                                        <DateRangePicker
                                            ranges={[{
                                                startDate: date?.from || new Date(),
                                                endDate: date?.to || new Date(),
                                                key: 'selection'
                                            }]}
                                            onChange={(ranges) => {
                                                const selection = ranges.selection;
                                                if (selection) {
                                                    onDateChange({
                                                        from: selection.startDate,
                                                        to: selection.endDate
                                                    });
                                                }
                                            }}
                                            months={1}
                                            direction="horizontal"
                                            showDateDisplay={false}
                                            moveRangeOnFirstSelection={false}
                                            rangeColors={['hsl(var(--primary))']}
                                        />
                                    )}
                                </div>
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            )}

            {/* Content Grid */}
            {aiUsage.length === 0 && !isLoading ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                        <Sparkles className="h-8 w-8 mb-2 opacity-20" />
                        <p>No usage data found for the selected period.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {isLoading ? (
                        // Show 3 skeleton cards to match StatCard loading state
                        Array.from({ length: 3 }).map((_, index) => (
                            <Card key={index} className="overflow-hidden">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-11 w-11 rounded-xl" />
                                </CardHeader>
                                <CardContent className="space-y-1">
                                    <Skeleton className="h-10 w-20" />
                                    <Skeleton className="h-5 w-32" />
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        allCards.map((card) => {
                            const config = typeConfig[card.eventType] || { label: card.eventType, icon: Sparkles, iconBg: "bg-primary/10", iconColor: "text-primary" };
                            const Icon = config.icon;
                            const cardKey = `${card.eventType}-${card.provider}-${card.modelName}`;

                            return (
                                <Card key={cardKey} className="relative overflow-hidden group hover:shadow-xl border-border/50 hover:border-primary/30 transition-all duration-300">
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                                        <div className="flex flex-col gap-2 flex-1">
                                            <Badge variant="outline" className={cn("w-fit text-xs", config.iconColor, "border-current")}>
                                                <Icon className="h-3 w-3 mr-1" />
                                                {config.label}
                                            </Badge>
                                            <CardTitle className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                                                {card.provider} - {card.modelName}
                                            </CardTitle>
                                        </div>
                                        <div className={cn("p-3 rounded-xl transition-all duration-300 group-hover:scale-110", config.iconBg)}>
                                            <Icon className={cn("h-5 w-5", config.iconColor)} />
                                        </div>
                                    </CardHeader>

                                    <CardContent className="space-y-1">
                                        <div className="text-4xl font-bold tracking-tight">
                                            {card.totalTokens.toLocaleString()}
                                        </div>
                                        <p className="text-sm text-muted-foreground font-medium">
                                            {config.unit || "Total Tokens"}
                                        </p>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
