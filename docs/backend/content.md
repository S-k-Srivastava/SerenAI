# Backend Documentation - Table of Contents

Welcome to the backend developer documentation. This guide provides comprehensive information about the Node.js/Express backend architecture, API endpoints, database schema, RAG system, authentication, and deployment strategies.

---

## Documentation Structure

### 1. [Overview](./overview.md)
**Essential reading for all developers**

- Architecture patterns and design principles
- Technology stack breakdown
- Project structure and file organization
- Request flow diagrams
- Key features summary
- Performance characteristics
- Security features
- Project statistics

**Start here to understand the system architecture and technology choices.**

---

### 2. [Environment Variables](./env.md)
**Configuration reference**

- All environment variables with descriptions
- Required vs optional variables
- Development vs production configs
- Docker Compose environment overrides
- Embedding service configuration
- Best practices for secrets management

**Use this when setting up new environments or troubleshooting configuration issues.**

---

### 3. [API Reference](./api.md)
**Complete API endpoint documentation**

- Response format standards
- Authentication routes (register, login, OAuth)
- Document management endpoints
- ChatBot CRUD operations
- Chat conversation APIs
- LLM configuration endpoints
- Dashboard and analytics
- Public routes (no auth required)
- Admin endpoints
- Error codes and rate limiting
- Interactive Swagger documentation

**Reference this when integrating with the API or building frontend features.**

---

### 4. [Database Schema](./database.md)
**MongoDB models and relationships**

- Entity relationship diagrams
- All Mongoose models with field definitions
- Indexes and performance optimization
- Qdrant vector database schema
- Repository pattern implementation
- Transaction usage patterns
- RBAC seeding scripts
- Migration strategy
- Backup recommendations

**Essential for understanding data structure and implementing new features.**

---

### 5. [RAG System](./rag-system.md)
**AI and retrieval-augmented generation**

- RAG pipeline architecture
- Document indexing flow
- Chat query processing
- Vector Service (Qdrant integration)
- Embedding providers (OpenAI vs Local)
- LLM providers (OpenAI vs Ollama)
- Token counting and usage tracking
- Performance tuning parameters
- Error handling strategies
- Scaling considerations

**Critical for understanding AI features and optimizing RAG performance.**

---

### 6. [Authentication & Authorization](./authentication.md)
**Security and access control**

- JWT token system (access + refresh)
- Authentication middleware
- RBAC (Role-Based Access Control)
- 50 permissions across 13 resources
- Admin and User roles
- ChatBot visibility and sharing
- Security best practices
- Common auth patterns
- Testing authentication
- Troubleshooting guide

**Required reading for implementing secure features and understanding permissions.**

---

### 7. [Deployment Guide](./deployment.md)
**Running the backend in different environments**

- Local development setup with start.sh
- Docker and Docker Compose configuration
- Development vs production modes
- Fresh start with clean database
- Environment validation
- Health checks and monitoring
- Backup strategies
- Security checklist
- Troubleshooting common issues

**Follow this for deploying to development, staging, or production environments.**

---

### 8. [Scripts Reference](./scripts.md)
**NPM scripts and utility tools**

- Type checking and code quality (typecheck, lint, format)
- Database management (seed:rbac, clean:db, make-admin)
- Testing scripts (test:api)
- logs.sh utility for container log management
- Docker integration commands
- CI/CD integration examples
- Best practices and troubleshooting

**Reference this for understanding available npm commands and automation tools. Always use start.sh to run the application.**

---

## Quick Start

### For New Developers

1. **Read [Overview](./overview.md)** - Understand architecture
2. **Setup Environment** - Follow [Deployment Guide](./deployment.md) → Local Development
3. **Configure Variables** - Reference [Environment Variables](./env.md)
4. **Explore API** - Open http://localhost:5000/api-docs (Swagger)
5. **Understand Data** - Review [Database Schema](./database.md)

### For API Consumers

1. **Authentication** - Read [Authentication](./authentication.md) → Get JWT token
2. **API Reference** - Browse [API Reference](./api.md) → Find endpoints
3. **Test Endpoints** - Use Swagger UI or Postman

### For DevOps Engineers

1. **Environment Setup** - [Environment Variables](./env.md)
2. **Deployment Options** - [Deployment Guide](./deployment.md)
3. **Monitoring** - [Deployment Guide](./deployment.md) → Monitoring & Logging
4. **Backups** - [Database Schema](./database.md) → Backup Strategy

### For ML/AI Engineers

1. **RAG Architecture** - [RAG System](./rag-system.md)
2. **Embedding Options** - [RAG System](./rag-system.md) → Embedding Providers
3. **Model Configuration** - [RAG System](./rag-system.md) → LLM Providers
4. **Performance Tuning** - [RAG System](./rag-system.md) → RAG Performance Tuning

---

## Key Concepts

### Architecture Pattern
**5-Tier Layered Architecture**:
```
Routes → Controllers → Services → Repositories → Models
```
- Clear separation of concerns
- Repository pattern for data access
- Factory pattern for AI providers
- Singleton pattern for shared services

### Authentication Flow
1. User registers/logs in
2. Server issues JWT access token (1h) + refresh token (7d)
3. Client includes `Authorization: Bearer <token>` in requests
4. Middleware verifies token and checks RBAC permissions
5. Controller processes request, service handles business logic

### RAG Pipeline
1. User sends question to chatbot
2. Backend embeds question (OpenAI or local)
3. Vector search in Qdrant (top 4 relevant chunks)
4. Build prompt: system prompt + context + history + question
5. Call LLM (OpenAI/Ollama) for response
6. Track token usage for billing
7. Return response + source documents

### RBAC System
- **Permissions**: `action:resource:scope` (e.g., `create:chatbot:self`)
- **Roles**: Collections of permissions (Admin: 27, User: 24)
- **Scopes**: `ALL` (global access) or `SELF` (own resources only)
- **Middleware**: `authorize()` enforces permissions on routes

---

## Common Tasks

### Add New API Endpoint

1. **Define Schema** - Create Zod schema in `src/schemas/`
2. **Create Route** - Add route in `src/routes/`
3. **Add Controller** - Create controller in `src/controllers/`
4. **Implement Service** - Add business logic in `src/services/`
5. **Update Repository** - Add data access methods in `src/repositories/`
6. **Add Middleware** - Include `authenticate`, `authorize`, `validateRequest`
7. **Test** - Use Swagger UI or write integration tests

### Add New Model

1. **Create Schema** - Define Mongoose schema in `src/models/`
2. **Add Indexes** - Define indexes for query performance
3. **Create Repository** - Extend `BaseRepository` in `src/repositories/`
4. **Update Types** - Add TypeScript interfaces in `src/types/`
5. **Seed Data** - Add seeder script if needed (in `src/utils/seeders/`)

### Add New Permission

1. **Update Enums** - Add to `ActionEnum`, `ResourceEnum` in `src/types/enums.ts`
2. **Update Seeder** - Add permission in `src/utils/seeders/rbacSeeder.ts`
3. **Run Seeder** - Execute `npm run seed:rbac`
4. **Assign to Roles** - Update role permissions in seeder
5. **Use in Routes** - Add `authorize()` middleware with new permission

### Configure New LLM Provider

1. **Create Service** - Implement `IModelService` in `src/ai/`
2. **Update Factory** - Add provider case in `src/ai/model.factory.ts`
3. **Update Enum** - Add to provider enum in schemas
4. **Test** - Create LLMConfig with new provider, send chat message

### Debug RAG Issues

1. **Check Embeddings** - Verify `USE_LOCAL_EMBEDDING` config
2. **Test Qdrant** - `curl http://localhost:6333/collections/documents`
3. **Check Chunks** - Query Qdrant for document chunks
4. **Enable Debug Logs** - Set `LOG_LEVEL=debug`
5. **Test Token Counting** - Check `UsageEvent` records in MongoDB
6. **Verify LLM Config** - Ensure user has valid API key/base URL

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Runtime** | Node.js 20+ | JavaScript runtime |
| **Framework** | Express.js 5 | HTTP server |
| **Language** | TypeScript 5 | Type safety |
| **Database** | MongoDB 6 | Document storage |
| **Vector DB** | Qdrant | Embeddings & search |
| **ODM** | Mongoose 8 | MongoDB modeling |
| **Auth** | JWT + bcrypt | Authentication |
| **AI Framework** | LangChain 1.2 | LLM orchestration |
| **Embeddings** | OpenAI / HF | Text vectorization |
| **LLMs** | OpenAI / Ollama | Text generation |
| **Validation** | Zod 4 | Schema validation |
| **Logging** | Winston 3 | Application logs |
| **API Docs** | Swagger | Interactive documentation |

---

## Project Statistics

- **Total Files**: 175 TypeScript files
- **Routes**: 17 route modules (50+ endpoints)
- **Models**: 13 Mongoose schemas
- **Permissions**: 45 granular RBAC permissions
- **Services**: 18 service modules
- **Repositories**: 14 data access layers
- **Middleware**: 10+ middleware functions
- **AI Components**: 10 AI/RAG service modules

---

## Development Workflow

### Git Branching Strategy
```
main (production)
  ↓
develop (staging)
  ↓
feature/feature-name (development)
```

### Code Review Checklist
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] Authentication/authorization implemented correctly
- [ ] Input validation with Zod schemas
- [ ] Error handling with custom error classes
- [ ] Transaction support for critical operations
- [ ] Logging for important events
- [ ] API documentation updated (Swagger comments)
- [ ] Tests added for new features

### Testing Strategy
- **Unit Tests**: Service layer logic (Jest/Mocha)
- **Integration Tests**: API endpoint testing
- **Manual Testing**: Swagger UI
- **Load Testing**: Artillery/k6 for performance

---

## Support & Resources

### Documentation Files
- [overview.md](./overview.md) - Architecture overview
- [env.md](./env.md) - Environment variables
- [api.md](./api.md) - API reference
- [database.md](./database.md) - Database schema
- [rag-system.md](./rag-system.md) - RAG system details
- [authentication.md](./authentication.md) - Auth & RBAC
- [deployment.md](./deployment.md) - Deployment guide
- [scripts.md](./scripts.md) - NPM scripts and utilities

### External Resources
- **Express.js**: https://expressjs.com/
- **Mongoose**: https://mongoosejs.com/
- **LangChain**: https://js.langchain.com/
- **Qdrant**: https://qdrant.tech/documentation/
- **JWT**: https://jwt.io/
- **Zod**: https://zod.dev/

### Getting Help
- Check relevant documentation section first
- Review error logs in `logs/` directory
- Test with Swagger UI at http://localhost:5000/api-docs
- Verify environment variables in `.env`
- Check database connectivity and replica set status
- Review recent code changes in Git history

---

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Complete RBAC system with 50 permissions
- RAG system with OpenAI and local embeddings
- Multi-provider LLM support (OpenAI, Ollama)
- Public chatbots with session-based conversations
- Comprehensive theming system
- Usage tracking and analytics
- Docker and serverless deployment support

---

## Contributing

### Code Style
- **Formatting**: Prettier (2 spaces, single quotes)
- **Linting**: ESLint with TypeScript rules
- **Naming**:
  - Files: kebab-case (e.g., `user.service.ts`)
  - Classes: PascalCase (e.g., `UserService`)
  - Functions: camelCase (e.g., `createUser`)
  - Constants: UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`)

### Commit Messages
```
feat: Add user profile endpoint
fix: Resolve authentication token expiry issue
docs: Update API documentation for chat routes
refactor: Simplify RAG service error handling
test: Add integration tests for document service
```

### Pull Request Process
1. Create feature branch from `develop`
2. Implement feature with tests
3. Update documentation
4. Run linters and type checks
5. Submit PR with description
6. Address review comments
7. Merge to `develop`, then to `main` for release

---

## License

[Your License Here]

---

## Contact

For questions or support, contact the development team or refer to the project repository.

---

**Last Updated**: 11 January 2026
**Documentation Version**: 1.0.0
