import { IPaginatedResult } from "./common";

export enum LLMProviderEnum {
  OPENAI = "OPENAI",
  OLLAMA = "OLLAMA"
}

export enum EmbeddingProviderEnum {
  OPENAI = "OPENAI",
  LOCAL = "LOCAL"
}

export interface ILLMConfig {
  _id: string;
  model_name: string;
  provider: LLMProviderEnum;
  api_key?: string;
  base_url?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateLLMConfigData {
  model_name: string;
  provider: LLMProviderEnum;
  api_key?: string;
  base_url?: string;
}

export interface UpdateLLMConfigData {
  model_name?: string;
  provider?: LLMProviderEnum;
  api_key?: string;
  base_url?: string;
}

export interface IFieldConfig {
  label: string;
  placeholder: string;
  type: "text" | "password" | "url";
  required: boolean;
  helpText?: string;
}

export interface IProviderFieldRequirements {
  api_key?: IFieldConfig;
  base_url?: IFieldConfig;
}

export interface IProviderOption {
  value: string;
  label: string;
  description: string;
  fields: IProviderFieldRequirements;
}

export interface IPublicModelConfigs {
  llmProviders: IProviderOption[];
  embeddingProviders: IProviderOption[];
}

export type LLMConfigsResponse = IPaginatedResult<ILLMConfig>;
