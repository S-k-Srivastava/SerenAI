import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const emailRegisterSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  firstName: z.string().min(2, "First Name must be at least 2 characters"),
  lastName: z.string().min(2, "Last Name must be at least 2 characters"),
});

export const ssoRegisterSchema = z.object({
  firstName: z.string().min(2, "First Name must be at least 2 characters"),
  lastName: z.string().min(2, "Last Name must be at least 2 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type EmailRegisterFormValues = z.infer<typeof emailRegisterSchema>;
export type SSORegisterFormValues = z.infer<typeof ssoRegisterSchema>;
