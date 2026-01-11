import { z } from 'zod';

export const planSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  currency: z.string().default("INR"),
  duration: z.coerce.number().int().min(1, "Duration must be at least 1 day").default(30),
  discountPercentage: z.coerce.number().min(0).max(100).optional(),
  discountOfferTitle: z.string().optional(),
  max_chatbot_count: z.coerce.number().int().min(0, "Chatbot count cannot be negative"),
  max_chatbot_shares: z.coerce.number().int().min(0, "Share count cannot be negative"),
  max_document_count: z.coerce.number().int().min(0, "Document count cannot be negative"),
  max_word_count_per_document: z.coerce.number().int().min(1, "Word count must be at least 1"),
  is_public_chatbot_allowed: z.boolean().default(false),
  benefits: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export type PlanFormValues = z.infer<typeof planSchema>;
