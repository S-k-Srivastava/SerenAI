import { z } from "zod";

export const RegisterSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Please provide a valid email address")
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
  }),
});

export const LoginSchema = z.object({
  body: z.object({
    email: z.string().email("Please provide a valid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const RefreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, "Refresh token is required"),
  }),
});

export const UpdateUserProfileSchema = z.object({
  body: z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    avatar: z.string().optional(),
  }),
});

// SSO Schemas
export const GoogleSSORegisterSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Google token is required"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
  }),
});

export const GoogleSSOLoginSchema = z.object({
  body: z.object({
    token: z.string().min(1, "Google token is required"),
  }),
});

export type RegisterRequest = z.infer<typeof RegisterSchema>["body"];
export type LoginRequest = z.infer<typeof LoginSchema>["body"];
export type RefreshTokenRequest = z.infer<typeof RefreshTokenSchema>["body"];
export type UpdateUserProfileRequest = z.infer<typeof UpdateUserProfileSchema>["body"];
export type GoogleSSORegisterRequest = z.infer<typeof GoogleSSORegisterSchema>["body"];
export type GoogleSSOLoginRequest = z.infer<typeof GoogleSSOLoginSchema>["body"];
