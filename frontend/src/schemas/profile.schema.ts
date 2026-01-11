import { z } from 'zod';

export const profileSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

export const renameChatSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
export type RenameChatFormValues = z.infer<typeof renameChatSchema>;
