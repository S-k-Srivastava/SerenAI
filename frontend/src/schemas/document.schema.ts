import { z } from 'zod';
import { DocumentVisibilityEnum } from '@/types/document';

export const documentSchema = z.object({
  name: z.string().min(1, "Document name is required"),
  description: z.string().min(1, "Description is required"),
  labels: z.array(z.string()).optional(),
  visibility: z.nativeEnum(DocumentVisibilityEnum),
});

export type DocumentFormValues = z.infer<typeof documentSchema>;
