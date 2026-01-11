# Backend Overview

## Architecture

The backend follows a **5-tier layered architecture** with clean separation of concerns:

```
Routes → Controllers → Services → Repositories → Models
         ↓
    Middleware (cross-cutting concerns)
         ↓
    AI/RAG System (specialized domain layer)
```

### Architectural Patterns

- **Layered Architecture**: Clear boundaries between presentation, business logic, and data layers
- **Repository Pattern**: Abstracts data access with transaction support
- **Factory Pattern**: Pluggable AI model and embedding providers
- **Singleton Pattern**: Database connection, vector service, RAG service
- **Dependency Injection**: Services accept repository instances for testability
- **Interface Segregation**: All major components have interface contracts

## Technology Stack

### Core
- **Runtime**: Node.js >=20.0.0
- **Framework**: Express.js 5.1.0
- **Language**: TypeScript 5.9.2

### Database
- **Primary DB**: MongoDB 6.0.0 (via Mongoose 8.18.1)
- **Vector DB**: Qdrant (for RAG embeddings)

### AI/ML Stack
- **LangChain**: 1.2.3 (orchestration framework)
- **OpenAI API**: Chat models + embeddings (text-embedding-3-small)
- **Ollama**: Local LLM hosting support
- **HuggingFace**: Local embeddings (BAAI/bge-base-en via TEI)
- **tiktoken**: Token counting for all models

### Security & Auth
- **JWT**: jsonwebtoken 9.0.2 (access + refresh tokens)
- **Password Hashing**: bcrypt.js 3.0.2 (12 rounds)
- **OAuth**: Google Sign-In (google-auth-library)
- **HTTP Security**: Helmet 8.1.0
- **CORS**: 2.8.5 (configurable origins)
- **Rate Limiting**: express-rate-limit 8.1.0 (100 req/15min)

### Validation & Docs
- **Schema Validation**: Zod 4.1.11 (type-safe)
- **API Docs**: Swagger (swagger-jsdoc + swagger-ui-express)

### Logging & Monitoring
- **Logger**: Winston 3.17.0 (console + daily file rotation)
- **Request Logs**: Morgan 1.10.1

## Key Libraries & Usage

### Core Dependencies
- **express** (5.1.0) - Web framework for HTTP server and routing
- **typescript** (5.9.2) - Static type checking and modern JavaScript features
- **dotenv** (17.2.2) - Load environment variables from .env file
- **mongoose** (8.18.1) - MongoDB ODM for schema definitions and queries

### Authentication & Security
- **jsonwebtoken** (9.0.2) - Generate and verify JWT access/refresh tokens
- **bcryptjs** (3.0.2) - Hash passwords with salt rounds for secure storage
- **helmet** (8.1.0) - Secure HTTP headers (XSS, CSP, etc.)
- **cors** (2.8.5) - Cross-origin resource sharing configuration
- **express-rate-limit** (8.1.0) - IP-based rate limiting for API endpoints
- **google-auth-library** (10.5.0) - Verify Google OAuth access tokens
- **passport** (0.7.0) - Authentication middleware framework
- **passport-google-oauth20** (2.0.0) - Google OAuth 2.0 strategy

### AI & RAG System
- **langchain** (1.2.3) - LLM orchestration and RAG pipeline framework
- **@langchain/openai** (1.2.0) - OpenAI models integration (GPT-4, embeddings)
- **@langchain/community** (1.1.2) - Community LLM providers and tools
- **@langchain/mongodb** (1.1.0) - MongoDB vector store for LangChain
- **@qdrant/js-client-rest** (1.16.2) - Qdrant vector database client
- **@huggingface/inference** (4.13.5) - HuggingFace models for local embeddings
- **tiktoken** (1.0.22) - Accurate token counting for OpenAI models
- **axios** (1.13.2) - HTTP client for external API calls

### Validation & Documentation
- **zod** (4.1.11) - Type-safe schema validation for request/response
- **swagger-jsdoc** (6.2.8) - Generate OpenAPI specs from JSDoc comments
- **swagger-ui-express** (5.0.1) - Interactive API documentation UI

### Logging & Utilities
- **winston** (3.17.0) - Flexible logging with multiple transports
- **morgan** (1.10.1) - HTTP request logger middleware
- **compression** (1.8.1) - Gzip compression for responses
- **uuid** (13.0.0) - Generate unique identifiers for chunks/sessions

### Development Tools
- **nodemon** (3.1.10) - Auto-restart server on file changes
- **tsx** (4.20.5) - Execute TypeScript files directly (for scripts)
- **eslint** (9.39.2) - Code linting and style enforcement
- **@typescript-eslint/parser** (8.51.0) - TypeScript parser for ESLint
- **prettier** (via npm scripts) - Code formatting

## Project Structure

```
node-backend/
├── src/
│   ├── ai/                      # RAG system components
│   │   ├── embedding.factory.ts       # Embedding provider factory
│   │   ├── model.factory.ts           # LLM provider factory
│   │   ├── rag.service.ts             # Main RAG orchestration
│   │   ├── vector.service.ts          # Qdrant integration
│   │   ├── token.service.ts           # Token counting
│   │   ├── openai.*.service.ts        # OpenAI providers
│   │   └── local.*.service.ts         # Local/Ollama providers
│   │
│   ├── config/                  # Configuration layer
│   │   ├── database/                  # MongoDB connection singleton
│   │   ├── env/                       # Environment validation
│   │   ├── server/                    # Express app setup
│   │   └── swagger/                   # API documentation
│   │
│   ├── controllers/             # HTTP request handlers
│   │   ├── auth.controller.ts         # Register, login, SSO
│   │   ├── user.*.controller.ts       # User-facing endpoints
│   │   ├── admin.*.controller.ts      # Admin-only endpoints
│   │   └── public.*.controller.ts     # Anonymous access
│   │
│   ├── middleware/              # Cross-cutting concerns
│   │   ├── auth/                      # JWT, RBAC, chatbot access
│   │   ├── validation/                # Zod schema validation
│   │   ├── error/                     # Global error handler
│   │   └── logging/                   # Request logger
│   │
│   ├── models/                  # Mongoose schemas
│   │   ├── User.ts                    # User accounts
│   │   ├── Role.ts                    # RBAC roles
│   │   ├── Permission.ts              # RBAC permissions
│   │   ├── ChatBot.ts                 # Chatbot configurations
│   │   ├── Document.ts                # User documents
│   │   ├── Conversation.ts            # Chat sessions (authenticated)
│   │   ├── PublicConversation.ts      # Chat sessions (anonymous)
│   │   ├── LLMConfig.ts               # User LLM settings
│   │   └── UsageEvent.ts              # Token tracking
│   │
│   ├── repositories/            # Data access layer
│   │   ├── BaseRepository.ts          # Generic CRUD + transactions
│   │   └── *.repository.ts            # Model-specific queries
│   │
│   ├── routes/                  # API route definitions
│   │   ├── auth.routes.ts             # /api/v1/auth
│   │   ├── user.*.routes.ts           # /api/v1/{resource}
│   │   ├── admin.*.routes.ts          # /api/v1/admin/{resource}
│   │   └── public.*.routes.ts         # /api/v1/public/{resource}
│   │
│   ├── schemas/                 # Zod validation schemas
│   │   └── *.ts                       # Request validation
│   │
│   ├── services/                # Business logic layer
│   │   ├── auth.service.ts            # Authentication
│   │   ├── user.*.service.ts          # User operations
│   │   ├── admin.*.service.ts         # Admin operations
│   │   └── public.*.service.ts        # Public operations
│   │
│   ├── errors/                  # Custom error classes
│   │   └── AppError.ts                # Base + specialized errors
│   │
│   ├── types/                   # TypeScript types
│   │   ├── enums.ts                   # RBAC enums
│   │   └── index.ts                   # Shared types
│   │
│   ├── utils/                   # Utility functions
│   │   ├── helpers/                   # Auth, response, async handlers
│   │   ├── logger/                    # Winston configuration
│   │   ├── seeders/                   # RBAC seeding scripts
│   │   └── constants/                 # Application constants
│   │
│   ├── scripts/                 # Utility scripts
│   │   ├── create_admin_user.ts       # npm run make-admin
│   │   └── cleanDb.ts                 # npm run clean:db
│   │
│   └── index.ts                 # Application entry point
│
├── logs/                        # Daily log files (YYYY-MM-DD.log)
├── Dockerfile                   # Production container
├── package.json                 # Dependencies & scripts
└── tsconfig.json                # TypeScript config
```

## Request Flow

### Typical Authenticated Request
```
1. HTTP Request → Express Router
2. authenticate middleware → Verify JWT, load user
3. authorize middleware → Check RBAC permissions
4. validateRequest middleware → Validate with Zod schema
5. Controller → Extract request data
6. Service → Business logic, call repositories
7. Repository → Database operations (with transactions)
8. Model → Mongoose schema enforcement
9. Response → Standardized JSON format
10. Error Handler → Catch and format errors
```

### RAG Chat Request Flow
```
1. User sends message → /api/v1/chat/conversation/:id
2. Auth + RBAC middleware → Verify access
3. Controller → Extract message and config
4. Service → Start MongoDB transaction
5. RAG Service → chat() method:
   a. Embed user question (OpenAI or local)
   b. Vector search in Qdrant (top 4 chunks)
   c. Build context prompt with history
   d. Call LLM (OpenAI/Ollama via LangChain)
   e. Track token usage → UsageEvent
6. Service → Update conversation in MongoDB
7. Service → Commit transaction
8. Response → Message + source documents
```

## Key Features

### 1. Multi-Tenant RAG System
- Users create chatbots backed by their documents
- Document chunking and vector indexing (Qdrant)
- Semantic search with context-aware responses
- Support for OpenAI and local embeddings

### 2. Flexible LLM Integration
- **OpenAI**: GPT-4, GPT-3.5-turbo, etc.
- **Ollama**: Self-hosted models (llama2, mistral, etc.)
- Users configure their own API keys and endpoints
- Per-chatbot temperature and max_tokens settings

### 3. RBAC Authorization
- Fine-grained permissions: `action:resource:scope`
- Scopes: `ALL` (global) or `SELF` (own resources only)
- Roles: Admin (26 permissions), User (24 permissions)
- Middleware enforces permissions on every route

### 4. Public Chatbots
- Chatbots with `visibility: PUBLIC` accessible without auth
- Session-based conversations (`session_id` instead of `user_id`)
- Usage tracked to chatbot owner's account

### 5. Comprehensive Theming
- 32 color properties per chatbot (light/dark mode)
- Light and dark mode support
- Custom logo upload
- Full UI customization for embedded chatbots

### 6. Usage Tracking
- Token-level tracking for all AI operations:
  - `CREATE_DOCUMENT_INDEX`: Embedding generation
  - `LLM_INPUT`: User messages
  - `LLM_OUTPUT`: Assistant responses
  - `QUERY_DOCUMENT`: Vector search queries
- Events tied to user for billing/analytics

### 7. Document Management
- Upload documents with auto-indexing
- Label-based organization
- Public/private visibility
- Word count quotas (configurable)
- Status tracking: `pending` → `indexed` / `failed`

### 8. Transaction Safety
- MongoDB transactions for critical operations:
  - Chat message send (conversation update + usage event)
  - Document creation (metadata + indexing)
- Atomic rollback on failures

## Deployment Modes

### 1. Development Mode
```bash
./start.sh --dev  # Starts with hot-reload
```
- Dependencies in Docker (MongoDB, Qdrant, Embeddings)
- Backend/Frontend run with hot-reload

### 2. Production Mode
```bash
./start.sh  # Full Docker deployment
```
- All services in Docker containers
- Builds from `Dockerfile`
- Seeds RBAC on startup
- Connects to containerized MongoDB + Qdrant
- See [deployment.md](./deployment.md) for complete guide

## Performance Characteristics

- **Connection Pooling**: MongoDB maxPoolSize: 10
- **Rate Limiting**: 100 requests / 15 minutes (production)
- **Request Size**: Max 10MB body
- **Vector Search**: Top 4 chunks per query (configurable)
- **Token Counting**: Accurate with tiktoken (no API calls)

## Security Features

- **Helmet**: XSS protection, CSP headers, etc.
- **CORS**: Whitelist-based origin validation
- **JWT**: Separate access (1h) and refresh (7d) tokens
- **Password Hashing**: bcrypt with 12 salt rounds
- **Input Validation**: Zod schemas on all routes
- **Rate Limiting**: Per-IP throttling
- **Error Sanitization**: No stack traces in production

## Statistics

- **Total Files**: 175 TypeScript files
- **Routes**: 17 route modules (50+ endpoints)
- **Models**: 13 Mongoose schemas
- **Permissions**: 50 granular permissions (action:resource:scope)
- **Middleware Layers**: 10+ middleware functions
- **Services**: 18 service modules

---

**Last Updated**: 11 January 2026
**Documentation Version**: 1.0.0
