export interface UsageEvent {
    date: string;
    provider: string;
    model_name: string;
    event_type: string;
    total_tokens: number;
}

export interface UsageEventGroup {
    event_type: string;
    events: {
        date: string;
        provider: string;
        model_name: string;
        total_tokens: number;
    }[];
}

export interface AdminStats {
    users: number;
    chatbots: number;
    conversations: number;
    roles: number;
    plans: number;
    aiUsage?: UsageEventGroup[];
}

export type IAdminStatsResponse = AdminStats;
