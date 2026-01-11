import { z } from "zod";

export const ChatRequestSchema = z.object({
    body: z.object({
        message: z.string().min(1, "Message is required"),
    }),
});

export const UpdateConversationTitleSchema = z.object({
    body: z.object({
        title: z.string().min(1, "Title is required"),
    }),
});

export const PublicChatRequestSchema = z.object({
    body: z.object({
        message: z.string().min(1, "Message is required"),
    }),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>["body"];
export type UpdateConversationTitleRequest = z.infer<typeof UpdateConversationTitleSchema>["body"];
export type PublicChatRequest = z.infer<typeof PublicChatRequestSchema>["body"];
