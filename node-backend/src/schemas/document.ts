import { z } from "zod";
import { DocumentVisibilityEnum } from "../models/Document.js";

// Schema for individual chunks
export const ChunkSchema = z.object({
    id: z.string(),
    content: z.string().min(1, "Chunk content is required"),
    index: z.number(),
    metadata: z.object({
        characterCount: z.number(),
        wordCount: z.number(),
    }),
});

export const CreateDocumentSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name is required"),
        chunks: z.array(ChunkSchema).min(1, "At least one chunk is required"),
        description: z.string().min(1, "Description is required"),
        labels: z.array(z.string()).optional(),
        visibility: z.nativeEnum(DocumentVisibilityEnum).default(DocumentVisibilityEnum.PRIVATE),
    }),
});

export const UpdateDocumentSchema = z.object({
    body: z.object({
        name: z.string().min(1, "Name cannot be empty").optional(),
        description: z.string().min(1, "Description cannot be empty"),
        labels: z.array(z.string()).optional(),
        visibility: z.nativeEnum(DocumentVisibilityEnum).optional(),
    }),
});

export type Chunk = z.infer<typeof ChunkSchema>;
export type CreateDocumentRequest = z.infer<typeof CreateDocumentSchema>["body"];
export type UpdateDocumentRequest = z.infer<typeof UpdateDocumentSchema>["body"];
