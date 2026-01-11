import { z } from "zod";

export const CreateUserSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    roles: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  }),
});

export const UpdateUserSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address").optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

export const UpdateUserRoleSchema = z.object({
  body: z.object({
    roleIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Role ID")),
  }),
});

export type CreateUserRequest = z.infer<typeof CreateUserSchema>["body"];
export type UpdateUserRequest = z.infer<typeof UpdateUserSchema>["body"];
export type UpdateUserRoleRequest = z.infer<typeof UpdateUserRoleSchema>["body"];
