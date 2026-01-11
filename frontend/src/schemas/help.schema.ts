import { z } from 'zod';

export const helpSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(10, "Message must be at least 10 characters"),
});

export type HelpFormValues = z.infer<typeof helpSchema>;
