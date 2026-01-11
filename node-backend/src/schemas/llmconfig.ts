import { z } from "zod";
import { LLMProviderEnum } from "../types/enums.js";

export const CreateLLMConfigSchema = z.object({
    body: z.object({
        model_name: z.string().min(1, "Model name is required"),
        provider: z.nativeEnum(LLMProviderEnum).default(LLMProviderEnum.OPENAI),
        api_key: z.string().optional(),
        base_url: z.string().optional(),
    }),
});

export const UpdateLLMConfigSchema = z.object({
    body: z.object({
        model_name: z.string().min(1, "Model name cannot be empty").optional(),
        provider: z.nativeEnum(LLMProviderEnum).optional(),
        api_key: z.string().optional(),
        base_url: z.string().optional(),
    }),
});

export type CreateLLMConfigRequest = z.infer<typeof CreateLLMConfigSchema>["body"];
export type UpdateLLMConfigRequest = z.infer<typeof UpdateLLMConfigSchema>["body"];
