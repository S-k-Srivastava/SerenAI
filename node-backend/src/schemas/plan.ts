import { z } from "zod";

export const CreatePlanSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().min(1, "Description is required"),
        price: z.number().min(0, "Price must be non-negative"),
        currency: z.string().optional(),
        duration: z.number().int().positive().optional(),
        discountPercentage: z.number().min(0).max(100).optional(),
        discountOfferTitle: z.string().optional(),
        max_chatbot_count: z.number().int().min(0, "Chatbot count cannot be negative"),
        max_chatbot_shares: z.number().int().min(0, "Share count cannot be negative"),
        max_document_count: z.number().int().min(0, "Document count cannot be negative"),
        max_word_count_per_document: z.number().int().min(0, "Word count cannot be negative"),
        is_public_chatbot_allowed: z.boolean().optional(),
        benefits: z.array(z.string()).min(1, "At least one benefit is required"),
        isActive: z.boolean().optional(),
    }),
});

export const UpdatePlanSchema = z.object({
    body: z.object({
        name: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        price: z.number().min(0).optional(),
        currency: z.string().optional(),
        duration: z.number().int().positive().optional(),
        discountPercentage: z.number().min(0).max(100).optional(),
        discountOfferTitle: z.string().optional(),
        max_chatbot_count: z.number().int().min(0).optional(),
        max_chatbot_shares: z.number().int().min(0).optional(),
        max_document_count: z.number().int().min(0).optional(),
        max_word_count_per_document: z.number().int().min(0).optional(),
        is_public_chatbot_allowed: z.boolean().optional(),
        benefits: z.array(z.string()).min(1, "At least one benefit is required"),
        isActive: z.boolean().optional(),
    }),
});

export type CreatePlanRequest = z.infer<typeof CreatePlanSchema>["body"];
export type UpdatePlanRequest = z.infer<typeof UpdatePlanSchema>["body"];
