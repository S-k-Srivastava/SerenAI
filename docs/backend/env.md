# Environment Variables

## Overview

Environment variables are defined in `node-backend/.env` based on the template in `node-backend/.env.example`. All variables are validated at startup in [config/env/index.ts](../../node-backend/src/config/env/index.ts).

---

## `.env.example` File Variables

These are the standard environment variables you should configure in your `node-backend/.env` file for local development.

### Authentication

#### `JWT_ACCESS_TOKEN_SECRET` **(required)**
- **Type**: `string`
- **Example**: Generate with `openssl rand -base64 32`
- **Description**: Secret key for signing JWT access tokens. Use cryptographically secure random string (min 32 chars).

#### `JWT_REFRESH_TOKEN_SECRET` **(required)**
- **Type**: `string`
- **Example**: Generate with `openssl rand -base64 32`
- **Description**: Secret key for signing JWT refresh tokens. Must differ from access token secret.

#### `JWT_ACCESS_TOKEN_EXPIRES_IN` **(required)**
- **Type**: `string`
- **Default**: `1h`
- **Description**: Access token expiration time (e.g., `1h`, `15m`, `2d`). Keep short for security.

#### `JWT_REFRESH_TOKEN_EXPIRES_IN` **(required)**
- **Type**: `string`
- **Default**: `7d`
- **Description**: Refresh token expiration time (e.g., `7d`, `30d`).

#### `BCRYPT_SALT_ROUNDS` **(required)**
- **Type**: `number`
- **Default**: `12`
- **Description**: Bcrypt salt rounds for password hashing. Higher = more secure but slower (10-14 recommended).

### OAuth / SSO Configuration

#### `GOOGLE_CLIENT_ID` **(optional)**
- **Type**: `string`
- **Get from**: https://console.cloud.google.com/
- **Description**: Google OAuth 2.0 client ID. **If not provided, Google Sign-In routes will not work**.

### API Configuration

#### `API_VERSION` **(required)**
- **Type**: `string`
- **Default**: `v1`
- **Description**: API version prefix for routes (`/api/v1/...`).

### Rate Limiting

#### `RATE_LIMIT_MAX_REQUESTS` **(optional)**
- **Type**: `number`
- **Default**: `100`
- **Description**: Maximum requests per IP in the time window. Only enforced in production.

#### `RATE_LIMIT_WINDOW_MS` **(optional)**
- **Type**: `number`
- **Default**: `900000` (15 minutes in milliseconds)
- **Description**: Time window for rate limiting.

### Embedding Configuration

#### `USE_LOCAL_EMBEDDING` **(required)**
- **Type**: `boolean`
- **Values**: `true` | `false`
- **Description**:
  - `true`: Use local HuggingFace embeddings (no API costs, requires TEI service)
  - `false`: Use OpenAI embeddings (requires `OPENAI_API_KEY`)

#### `EMBEDDING_LOCAL_MODEL` **(conditional)**
- **Type**: `string`
- **Default**: `BAAI/bge-base-en`
- **Required when**: `USE_LOCAL_EMBEDDING=true`
- **Description**: HuggingFace model for local embeddings. Recommended: `BAAI/bge-base-en` (768 dims, good balance) or `BAAI/bge-small-en` (384 dims, lighter).

#### `OPENAI_API_KEY` **(conditional)**
- **Type**: `string`
- **Get from**: https://platform.openai.com/api-keys
- **Required when**: `USE_LOCAL_EMBEDDING=false`
- **Description**: OpenAI API key for embeddings (`text-embedding-3-small`). Not required for chat models (users provide their own keys via LLMConfig).

---

## Docker Compose Environment Variables

**Note: These are NOT used frequently for local development.** They are defined in [docker-compose.yml](../../docker-compose.yml) and override `.env` values when running the full stack in Docker containers.

### Backend Service Overrides

When running `docker compose up`, these environment variables are injected into the backend container:

#### `NODE_ENV`
- **Value**: `production`
- **Description**: Forces production mode in Docker container.

#### `CORS_ORIGIN`
- **Value**: `http://localhost:3000`
- **Description**: Frontend origin for CORS. Update this for production domain.

#### `LOG_LEVEL`
- **Value**: `info`
- **Description**: Reduces log verbosity in Docker (less noisy than `debug`).

#### `MONGODB_URI`
- **Value**: `mongodb://mongodb:27017/serenai?replicaSet=rs0`
- **Description**: Uses Docker service name `mongodb` instead of `localhost`. The Docker network allows containers to communicate via service names.

#### `MONGODB_DATABASE_NAME`
- **Value**: `serenai`
- **Description**: Database name for Docker deployment.

#### `QDRANT_URL`
- **Value**: `http://qdrant:6333`
- **Description**: Uses Docker service name `qdrant` instead of `localhost`.

#### `QDRANT_API_KEY`
- **Value**: `` (empty)
- **Description**: No authentication for local Docker Qdrant instance.

#### `EMBEDDING_SERVICE_URL`
- **Value**: `http://embeddings:80`
- **Description**: Uses Docker service name `embeddings` for the HuggingFace TEI service.

### Embeddings Service Configuration

The `embeddings` Docker service uses:
```yaml
command: ["--model-id", "${EMBEDDING_LOCAL_MODEL:-BAAI/bge-base-en}", "--port", "80"]
profiles:
  - local-embeddings
```

**To use local embeddings with Docker**:
```bash
# The start.sh script handles this automatically based on USE_LOCAL_EMBEDDING in .env
./start.sh
```

---

## Example `.env` File

Create this file at `node-backend/.env`:

```bash
# ============================================
# Authentication
# ============================================
# Generate secure secrets: openssl rand -base64 32
JWT_ACCESS_TOKEN_SECRET=your-super-secret-jwt-access-key-here-change-in-production
JWT_REFRESH_TOKEN_SECRET=your-super-secret-jwt-refresh-key-here-change-in-production
JWT_ACCESS_TOKEN_EXPIRES_IN=1h
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12

# ============================================
# OAuth / SSO Configuration
# ============================================
# Get from: https://console.cloud.google.com/
# If not provided, Google Sign In routes will not work
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# ============================================
# API Configuration
# ============================================
API_VERSION=v1

# ============================================
# Rate Limiting (optional)
# ============================================
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# ============================================
# Embedding Configuration
# ============================================
# Set to true for local embeddings, false for OpenAI
USE_LOCAL_EMBEDDING=true

# Local Embedding Model (only if USE_LOCAL_EMBEDDING=true)
# Requires decent CPU (at least i5 10th Gen or better)
EMBEDDING_LOCAL_MODEL=BAAI/bge-base-en

# OpenAI API Key (only if USE_LOCAL_EMBEDDING=false)
# Get from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here
```

---

## Environment Validation

At startup, [config/env/index.ts](../../node-backend/src/config/env/index.ts:32-49) validates these required variables:

```typescript
const requiredEnvVars = [
  "JWT_ACCESS_TOKEN_SECRET",
  "JWT_REFRESH_TOKEN_SECRET",
  "JWT_ACCESS_TOKEN_EXPIRES_IN",
  "JWT_REFRESH_TOKEN_EXPIRES_IN",
  "BCRYPT_SALT_ROUNDS",
  "API_VERSION",
  "USE_LOCAL_EMBEDDING",
];
```

**Missing required variables will throw an error and prevent server startup.**

### Conditional Validation

- If `USE_LOCAL_EMBEDDING=true` → `EMBEDDING_LOCAL_MODEL` is required
- If `USE_LOCAL_EMBEDDING=false` → `OPENAI_API_KEY` is required

---

## Best Practices

1. **Never commit `.env` to version control** - Use `.env.example` as a template
2. **Use strong, unique secrets** - Generate with `openssl rand -base64 32` for JWT secrets
3. **Separate secrets per environment** - Different keys for dev/staging/prod
4. **Keep token expiry reasonable** - 1h for access, 7-30 days for refresh
5. **Use local embeddings for dev** - Save API costs during development
6. **Enable rate limiting in production** - Prevent API abuse
7. **Restrict CORS origins** - Never use `*` in production
8. **Rotate secrets periodically** - Change JWT secrets every 6-12 months in production

---

## Troubleshooting

### "Missing required variable" error
**Cause**: Required environment variable not set in `.env`
**Solution**: Copy from `.env.example` and set appropriate value

### "OPENAI_API_KEY must be set" error
**Cause**: `USE_LOCAL_EMBEDDING=false` but no OpenAI API key provided
**Solution**: Either set `OPENAI_API_KEY` or change `USE_LOCAL_EMBEDDING=true`

### "EMBEDDING_LOCAL_MODEL must be set" error
**Cause**: `USE_LOCAL_EMBEDDING=true` but no model specified
**Solution**: Set `EMBEDDING_LOCAL_MODEL=BAAI/bge-base-en` (or another HF model)

### Docker containers can't connect to MongoDB/Qdrant
**Cause**: Using `localhost` in connection strings instead of Docker service names
**Solution**: The `start.sh` script handles this automatically. For manual Docker runs, use service names like `mongodb://mongodb:27017`

---

**Last Updated**: 11 January 2026
**Documentation Version**: 1.0.0
