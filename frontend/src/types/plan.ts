export interface IPlan {
    _id: string;
    name: string;
    description: string;
    price: number;
    currency: string;
    duration: number;
    discountPercentage: number;
    discountOfferTitle?: string;
    max_chatbot_count: number;
    max_chatbot_shares: number;
    max_document_count: number;
    max_word_count_per_document: number;
    is_public_chatbot_allowed: boolean;
    benefits: string[];
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePlanData {
    name: string;
    description: string;
    price: number;
    currency?: string;
    duration?: number;
    discountPercentage?: number;
    discountOfferTitle?: string;
    max_chatbot_count: number;
    max_chatbot_shares: number;
    max_document_count: number;
    max_word_count_per_document: number;
    is_public_chatbot_allowed?: boolean;
    isActive?: boolean;
}

export type UpdatePlanData = Partial<CreatePlanData>;

export interface PlansResponse {
    data: IPlan[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
