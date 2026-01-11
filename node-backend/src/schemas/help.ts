import { z } from "zod";

export const CreateHelpSchema = z.object({
  body: z.object({
    subject: z.string().min(1, "Subject is required").max(200, "Subject cannot exceed 200 characters"),
    body: z.string().min(1, "Message is required").max(2000, "Message cannot exceed 2000 characters"),
  }),
});

export const ReplyHelpSchema = z.object({
  body: z.object({
    content: z.string().min(1, "Reply content is required").max(5000, "Reply cannot exceed 5000 characters"),
  }),
});

export type CreateHelpRequest = z.infer<typeof CreateHelpSchema>["body"];
export type ReplyHelpRequest = z.infer<typeof ReplyHelpSchema>["body"];
