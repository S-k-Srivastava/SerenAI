import { IProviderFieldRequirements } from "./index.js";

export enum LLMProviderEnum {
  OPENAI = "OPENAI",
  OLLAMA = "OLLAMA"
}

export enum EmbeddingProviderEnum {
  OPENAI = "OPENAI",
  LOCAL = "LOCAL"
}

export const LLMProviderDescriptions: Record<LLMProviderEnum, string> = {
  [LLMProviderEnum.OPENAI]: "OpenAI GPT models - Requires OpenAI API key. Get it from https://platform.openai.com/api-keys",
  [LLMProviderEnum.OLLAMA]: "Ollama - Run LLMs locally. Requires Ollama installation and base URL (e.g., http://localhost:11434)"
};

export const LLMProviderFieldRequirements: Record<LLMProviderEnum, IProviderFieldRequirements> = {
  [LLMProviderEnum.OPENAI]: {
    api_key: {
      label: "API Key",
      placeholder: "sk-...",
      type: "password",
      required: true,
      helpText: "Get your API key from https://platform.openai.com/api-keys"
    }
  },
  [LLMProviderEnum.OLLAMA]: {
    base_url: {
      label: "Base URL",
      placeholder: "http://localhost:11434",
      type: "url",
      required: true,
      helpText: "The base URL of your Ollama server (e.g., http://localhost:11434)"
    }
  }
};

export const EmbeddingProviderDescriptions: Record<EmbeddingProviderEnum, string> = {
  [EmbeddingProviderEnum.OPENAI]: "OpenAI Embeddings - Requires OpenAI API key. Supports text-embedding-3-small, text-embedding-3-large, and ada-002",
  [EmbeddingProviderEnum.LOCAL]: "HuggingFace Local Embeddings - Uses sentence-transformers/all-MiniLM-L6-v2 model. No API key required"
};

export const EmbeddingProviderFieldRequirements: Record<EmbeddingProviderEnum, IProviderFieldRequirements> = {
  [EmbeddingProviderEnum.OPENAI]: {},
  [EmbeddingProviderEnum.LOCAL]: {}
};
