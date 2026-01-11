import { z } from "zod";
import { ContactUsStatusEnum } from "../types/index.js";

export const CreateContactUsSchema = z.object({
  body: z.object({
    subject: z
      .string()
      .min(1, "Subject is required")
      .max(200, "Subject cannot exceed 200 characters"),
    email: z.string().email("Please provide a valid email"),
    body: z
      .string()
      .min(1, "Message is required")
      .max(2000, "Message cannot exceed 2000 characters"),
  }),
});

export const UpdateContactUsStatusSchema = z.object({
  body: z.object({
    status: z.nativeEnum(ContactUsStatusEnum, {
      message: "Invalid status value",
    }),
  }),
});

export const GetContactUsQuerySchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
    status: z.nativeEnum(ContactUsStatusEnum).optional(),
    search: z.string().optional(),
  }),
});

export type CreateContactUsRequest = z.infer<typeof CreateContactUsSchema>["body"];
export type UpdateContactUsStatusRequest = z.infer<typeof UpdateContactUsStatusSchema>["body"];
export type GetContactUsQuery = z.infer<typeof GetContactUsQuerySchema>["query"];
