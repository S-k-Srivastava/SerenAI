import { z } from 'zod';

export const contactFormSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  email: z.string().email("Invalid email address"),
  body: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
