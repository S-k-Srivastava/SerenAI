import { z } from 'zod';
import { LLMProviderEnum } from '@/types/llmconfig';

export const llmConfigSchema = z.object({
  model_name: z.string().min(1, "Model name is required"),
  provider: z.nativeEnum(LLMProviderEnum),
  api_key: z.string().optional(),
  base_url: z.string().optional(),
});

export type LLMConfigFormValues = z.infer<typeof llmConfigSchema>;
