import dotenv from "dotenv";

dotenv.config();

interface IEnvConfig {
  NODE_ENV: string;
  PORT: number;
  MONGODB_URI: string;
  JWT_ACCESS_TOKEN_SECRET: string;
  JWT_REFRESH_TOKEN_SECRET: string;
  JWT_ACCESS_TOKEN_EXPIRES_IN: string;
  JWT_REFRESH_TOKEN_EXPIRES_IN: string;

  BCRYPT_SALT_ROUNDS: number;
  CORS_ORIGIN: string;
  LOG_LEVEL: string;
  API_VERSION: string;

  OPENAI_API_KEY: string;
  QDRANT_URL: string;
  QDRANT_API_KEY: string | undefined;
  QDRANT_COLLECTION_NAME: string;
  MONGODB_DATABASE_NAME: string;

  // SSO Configuration
  GOOGLE_CLIENT_ID: string;

  // Embedding Configuration
  USE_LOCAL_EMBEDDING: boolean;
  EMBEDDING_LOCAL_MODEL: string;
}
const requiredEnvVars = [
  "NODE_ENV",
  "PORT",
  "MONGODB_URI",
  "JWT_ACCESS_TOKEN_SECRET",
  "JWT_REFRESH_TOKEN_SECRET",
  "JWT_ACCESS_TOKEN_EXPIRES_IN",
  "JWT_REFRESH_TOKEN_EXPIRES_IN",

  "BCRYPT_SALT_ROUNDS",
  "CORS_ORIGIN",
  "LOG_LEVEL",
  "API_VERSION",

  "USE_LOCAL_EMBEDDING",

  // SSO
] as const;

const validateEnv = (): IEnvConfig => {
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName]
  );

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  return {
    NODE_ENV: process.env.NODE_ENV!,
    PORT: parseInt(process.env.PORT!),
    MONGODB_URI: process.env.MONGODB_URI!,
    JWT_ACCESS_TOKEN_SECRET: process.env.JWT_ACCESS_TOKEN_SECRET!,
    JWT_REFRESH_TOKEN_SECRET: process.env.JWT_REFRESH_TOKEN_SECRET!,
    JWT_ACCESS_TOKEN_EXPIRES_IN: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN!,
    JWT_REFRESH_TOKEN_EXPIRES_IN: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN!,

    BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS!),
    CORS_ORIGIN: process.env.CORS_ORIGIN!,
    LOG_LEVEL: process.env.LOG_LEVEL!,
    API_VERSION: process.env.API_VERSION!,

    OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
    QDRANT_URL: process.env.QDRANT_URL || "http://localhost:6333",
    QDRANT_API_KEY: process.env.QDRANT_API_KEY || undefined,
    QDRANT_COLLECTION_NAME: process.env.QDRANT_COLLECTION_NAME || "documents",
    MONGODB_DATABASE_NAME: process.env.MONGODB_DATABASE_NAME || "test_db",

    // SSO Configuration
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",

    // Embedding Configuration
    USE_LOCAL_EMBEDDING: process.env.USE_LOCAL_EMBEDDING === "true",
    EMBEDDING_LOCAL_MODEL: process.env.EMBEDDING_LOCAL_MODEL || "BAAI/bge-base-en",
  };
};

export const env = validateEnv();
