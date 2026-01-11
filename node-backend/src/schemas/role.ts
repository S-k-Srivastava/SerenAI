import { z } from "zod";

export const CreateRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Role name is required"),
    description: z.string().optional(),
    permissionIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Permission ID")),
  }),
});

export const UpdateRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Role name cannot be empty").optional(),
    description: z.string().optional(),
    permissionIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid Permission ID")).optional(),
    isActive: z.boolean().optional(),
  }),
});

export type CreateRoleRequest = z.infer<typeof CreateRoleSchema>["body"];
export type UpdateRoleRequest = z.infer<typeof UpdateRoleSchema>["body"];
