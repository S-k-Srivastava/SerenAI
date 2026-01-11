# API Reference

Base URL: `/api/v1`

**Interactive Documentation**: http://localhost:5000/api-docs (Swagger UI)

All authenticated endpoints require JWT access token: `Authorization: Bearer <token>`

---

## Response Format

All API responses follow this standard format:

```json
{
  "data": { /* response payload or null */ },
  "error": "error message or null",
  "status": 200,
  "message": "Success message",
  "pagination": { /* only for paginated responses */
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

---

## Authentication Routes

Base: `/api/v1/auth`

### POST `/auth/register`
**Description**: Register a new user account

**Middlewares**:
- `validateRequest` - Validates request body against schema

**Payload**: [RegisterSchema](../../node-backend/src/schemas/auth.ts)
```typescript
{
  email: string,
  password: string,
  firstName: string,
  lastName: string
}
```

**Response**: User object with JWT tokens
```typescript
{
  user: {
    id: string,
    email: string,
    firstName: string,
    lastName: string
  },
  tokens: {
    accessToken: string,
    refreshToken: string
  }
}
```

**Controller**: [auth.controller.ts](../../node-backend/src/controllers/auth.controller.ts) - `register`

---

### POST `/auth/login`
**Description**: Login with email and password

**Middlewares**:
- `validateRequest` - Validates credentials

**Payload**: [LoginSchema](../../node-backend/src/schemas/auth.ts)
```typescript
{
  email: string,
  password: string
}
```

**Response**: User object with JWT tokens (same as register)

**Controller**: [auth.controller.ts](../../node-backend/src/controllers/auth.controller.ts) - `login`

---

### POST `/auth/sso/google/register`
**Description**: Register with Google SSO

**Middlewares**:
- `validateRequest` - Validates Google access token

**Payload**: [GoogleSSORegisterSchema](../../node-backend/src/schemas/auth.ts)
```typescript
{
  accessToken: string  // Google OAuth access token
}
```

**Response**: User object with JWT tokens

**Controller**: [auth.controller.ts](../../node-backend/src/controllers/auth.controller.ts) - `googleSSORegister`

---

### POST `/auth/sso/google/login`
**Description**: Login with Google SSO

**Middlewares**:
- `validateRequest` - Validates Google access token

**Payload**: [GoogleSSOLoginSchema](../../node-backend/src/schemas/auth.ts)
```typescript
{
  accessToken: string  // Google OAuth access token
}
```

**Response**: User object with JWT tokens

**Controller**: [auth.controller.ts](../../node-backend/src/controllers/auth.controller.ts) - `googleSSOLogin`

---

### GET `/auth/me`
**Description**: Get current logged-in user profile

**Middlewares**:
- `authenticate` - Verifies JWT token and loads user
- `authorize` - Checks permission: `READ:PROFILE:SELF`

**Payload**: None

**Response**: User profile with quota and subscription details

**Controller**: [auth.controller.ts](../../node-backend/src/controllers/auth.controller.ts) - `getMe`

---

### PUT `/auth/profile`
**Description**: Update current user profile

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `UPDATE:PROFILE:SELF`
- `validateRequest` - Validates profile data

**Payload**: [UpdateUserProfileSchema](../../node-backend/src/schemas/auth.ts)
```typescript
{
  firstName?: string,
  lastName?: string
}
```

**Response**: Updated user object

**Controller**: [auth.controller.ts](../../node-backend/src/controllers/auth.controller.ts) - `updateProfile`

---

### POST `/auth/refresh`
**Description**: Refresh access token using refresh token

**Middlewares**:
- `validateRequest` - Validates refresh token

**Payload**: [RefreshTokenSchema](../../node-backend/src/schemas/auth.ts)
```typescript
{
  refreshToken: string
}
```

**Response**: New access token
```typescript
{
  accessToken: string
}
```

**Controller**: [auth.controller.ts](../../node-backend/src/controllers/auth.controller.ts) - `refreshToken`

---

## Document Routes

Base: `/api/v1/documents`

All routes require authentication (applied globally to router).

### POST `/documents`
**Description**: Create and index a new document

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `CREATE:DOCUMENT:SELF`
- `validateRequest` - Validates document data

**Payload**: [CreateDocumentSchema](../../node-backend/src/schemas/document.ts)
```typescript
{
  name: string,
  chunks: Array<{
    chunk_id: string,
    text: string,
    chunk_index: number
  }>,
  description?: string,
  labels?: string[],
  visibility?: "PUBLIC" | "PRIVATE"
}
```

**Response**: Created document object with indexing status

**Controller**: [user.documents.controller.ts](../../node-backend/src/controllers/user.documents.controller.ts) - `createDocument`

---

### GET `/documents`
**Description**: Get all documents with pagination, search, and label filtering

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `READ:DOCUMENT:SELF`

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 10, max: 100)
- `search` (optional: searches name and description)
- `label` (optional: filter by label)

**Response**: Paginated list of documents

**Controller**: [user.documents.controller.ts](../../node-backend/src/controllers/user.documents.controller.ts) - `getDocuments`

---

### GET `/documents/labels`
**Description**: Get unique document labels for current user

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `READ:DOCUMENT:SELF`

**Payload**: None

**Response**: Array of unique labels
```typescript
{
  labels: string[]
}
```

**Controller**: [user.documents.controller.ts](../../node-backend/src/controllers/user.documents.controller.ts) - `getLabels`

---

### GET `/documents/:id`
**Description**: Get document by ID with chunks from vector database

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `READ:DOCUMENT:SELF`

**Payload**: None

**Response**: Document object with chunks

**Controller**: [user.documents.controller.ts](../../node-backend/src/controllers/user.documents.controller.ts) - `getDocumentById`

---

### PATCH `/documents/:id`
**Description**: Update document metadata (name, description, labels only)

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `UPDATE:DOCUMENT:SELF`
- `validateRequest` - Validates update data

**Payload**: [UpdateDocumentSchema](../../node-backend/src/schemas/document.ts)
```typescript
{
  name?: string,
  description?: string,
  labels?: string[]
}
```

**Response**: Updated document object

**Note**: Cannot update chunks after creation

**Controller**: [user.documents.controller.ts](../../node-backend/src/controllers/user.documents.controller.ts) - `updateDocument`

---

### DELETE `/documents/:id`
**Description**: Delete document from MongoDB and Qdrant

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `DELETE:DOCUMENT:SELF`

**Payload**: None

**Response**: Success message

**Controller**: [user.documents.controller.ts](../../node-backend/src/controllers/user.documents.controller.ts) - `deleteDocument`

---

## ChatBot Routes

Base: `/api/v1/chatbots`

All routes require authentication (applied globally to router).

### POST `/chatbots`
**Description**: Create a new chatbot

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `CREATE:CHATBOT:SELF`
- `validateRequest` - Validates chatbot data

**Payload**: [CreateChatBotSchema](../../node-backend/src/schemas/chatbot.ts)
```typescript
{
  name: string,
  document_ids: string[],
  system_prompt?: string,
  visibility?: "PUBLIC" | "PRIVATE" | "SHARED",
  llm_config_id?: string,
  view_source_documents?: boolean,
  temperature?: number,
  max_tokens?: number,
  theme?: { /* 32 color properties + layout options */ },
  logo?: string
}
```

**Response**: Created chatbot object

**Controller**: [user.chatbots.controller.ts](../../node-backend/src/controllers/user.chatbots.controller.ts) - `createChatBot`

---

### GET `/chatbots`
**Description**: Get all chatbots with pagination and search

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `READ:CHATBOT:SELF`

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 10)
- `search` (optional: searches chatbot name)

**Response**: Paginated list of chatbots with populated user and documents

**Controller**: [user.chatbots.controller.ts](../../node-backend/src/controllers/user.chatbots.controller.ts) - `getChatBots`

---

### GET `/chatbots/:id`
**Description**: Get chatbot by ID

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `READ:CHATBOT:SELF`
- `verifyChatBotAccess` - Checks if user can access chatbot (owner, PUBLIC, or shared_with)

**Payload**: None

**Response**: Chatbot object

**Controller**: [user.chatbots.controller.ts](../../node-backend/src/controllers/user.chatbots.controller.ts) - `getChatBotById`

---

### PATCH `/chatbots/:id`
**Description**: Update chatbot

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `UPDATE:CHATBOT:SELF`
- `verifyChatBotOwner` - Ensures user is the chatbot owner
- `validateRequest` - Validates update data

**Payload**: [UpdateChatBotSchema](../../node-backend/src/schemas/chatbot.ts) (partial)

**Response**: Updated chatbot object

**Controller**: [user.chatbots.controller.ts](../../node-backend/src/controllers/user.chatbots.controller.ts) - `updateChatBot`

---

### DELETE `/chatbots/:id`
**Description**: Delete chatbot

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `DELETE:CHATBOT:SELF`
- `verifyChatBotOwner` - Ensures user is the chatbot owner

**Payload**: None

**Response**: Success message

**Controller**: [user.chatbots.controller.ts](../../node-backend/src/controllers/user.chatbots.controller.ts) - `deleteChatBot`

---

### PATCH `/chatbots/:id/visibility`
**Description**: Update chatbot visibility (PUBLIC/PRIVATE/SHARED)

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `UPDATE:CHATBOT:SELF`
- `verifyChatBotOwner` - Ensures user is the chatbot owner
- `validateRequest` - Validates visibility value

**Payload**: [UpdateVisibilitySchema](../../node-backend/src/schemas/chatbot.ts)
```typescript
{
  visibility: "PUBLIC" | "PRIVATE" | "SHARED"
}
```

**Response**: Updated chatbot object

**Controller**: [user.chatbots.controller.ts](../../node-backend/src/controllers/user.chatbots.controller.ts) - `updateVisibility`

---

### POST `/chatbots/:id/share`
**Description**: Share chatbot with users by email

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `UPDATE:CHATBOT:SELF`
- `verifyChatBotOwner` - Ensures user is the chatbot owner
- `validateRequest` - Validates email array

**Payload**: [ShareChatBotSchema](../../node-backend/src/schemas/chatbot.ts)
```typescript
{
  emails: string[]
}
```

**Response**: Share result with chatbot details and shared_with array populated

**Controller**: [user.chatbots.controller.ts](../../node-backend/src/controllers/user.chatbots.controller.ts) - `shareChatBot`

---

## Chat Routes

Base: `/api/v1/chat`

### POST `/chat/:chatbotId/start`
**Description**: Start a new conversation with a chatbot

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `READ:CHATBOT:SELF`
- `verifyChatBotAccess` - Checks if user can access chatbot

**Payload**: None

**Response**: New conversation ID
```typescript
{
  conversationId: string
}
```

**Controller**: [user.chats.controller.ts](../../node-backend/src/controllers/user.chats.controller.ts) - `startConversation`

---

### GET `/chat`
**Description**: Get all conversations with pagination and search

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `READ:CHATBOT:SELF`

**Query Parameters**:
- `page` (default: 1)
- `limit` (default: 10)
- `search` (optional: searches conversation title)

**Response**: Paginated list of conversations

**Controller**: [user.chats.controller.ts](../../node-backend/src/controllers/user.chats.controller.ts) - `getAllConversations`

---

### GET `/chat/conversations/:id`
**Description**: Get specific conversation with message history

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `READ:CHAT:SELF`

**Payload**: None

**Response**: Conversation object with messages and populated source documents

**Controller**: [user.chats.controller.ts](../../node-backend/src/controllers/user.chats.controller.ts) - `getConversation`

---

### POST `/chat/conversations/:id/message`
**Description**: Send a message to a conversation (RAG pipeline)

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `UPDATE:CHAT:SELF`
- `validateRequest` - Validates message

**Payload**: [ChatRequestSchema](../../node-backend/src/schemas/chat.ts)
```typescript
{
  message: string
}
```

**Response**: User message and AI response with source documents
```typescript
{
  conversation: {
    messages: [...],
    // includes user message and assistant response
  },
  sourceDocuments: [
    {
      chunk_id: string,
      text: string,
      document_id: string,
      chunk_index: number
    }
  ]
}
```

**Controller**: [user.chats.controller.ts](../../node-backend/src/controllers/user.chats.controller.ts) - `sendMessageToConversation`

---

### DELETE `/chat/conversations/:id`
**Description**: Delete a conversation

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `DELETE:CHAT:SELF`

**Payload**: None

**Response**: Success message

**Controller**: [user.chats.controller.ts](../../node-backend/src/controllers/user.chats.controller.ts) - `deleteConversation`

---

### PATCH `/chat/conversations/:id/title`
**Description**: Update conversation title

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `UPDATE:CHATBOT:SELF`
- `validateRequest` - Validates title

**Payload**: [UpdateConversationTitleSchema](../../node-backend/src/schemas/chat.ts)
```typescript
{
  title: string
}
```

**Response**: Updated conversation object

**Controller**: [user.chats.controller.ts](../../node-backend/src/controllers/user.chats.controller.ts) - `updateConversationTitle`

---

## Dashboard Routes

Base: `/api/v1/dashboard`

### GET `/dashboard`
**Description**: Get user dashboard statistics

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `READ:DASHBOARD:SELF`

**Payload**: None

**Response**: Dashboard statistics
```typescript
{
  totalChatbots: number,
  totalDocuments: number,
  totalConversations: number,
  totalMessages: number,
  recentActivity: Array<{...}>
}
```

**Controller**: [user.dashboard.controller.ts](../../node-backend/src/controllers/user.dashboard.controller.ts) - `getStats`

---

## LLM Config Routes

Base: `/api/v1/llmconfigs`

All routes require authentication (applied globally to router).

### POST `/llmconfigs`
**Description**: Create a new LLM configuration

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `CREATE:LLM_CONFIG:SELF`
- `validateRequest` - Validates LLM config data

**Payload**: [CreateLLMConfigSchema](../../node-backend/src/schemas/llmconfig.ts)
```typescript
{
  model_name: string,
  provider: "OPENAI" | "OLLAMA",
  api_key?: string,  // Required for OpenAI
  base_url?: string  // Required for Ollama
}
```

**Response**: Created LLM config object

**Controller**: [user.llmconfigs.controller.ts](../../node-backend/src/controllers/user.llmconfigs.controller.ts) - `createLLMConfig`

---

### GET `/llmconfigs`
**Description**: Get all LLM configurations for current user

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `READ:LLM_CONFIG:SELF`

**Payload**: None

**Response**: Paginated list of LLM configurations

**Controller**: [user.llmconfigs.controller.ts](../../node-backend/src/controllers/user.llmconfigs.controller.ts) - `getLLMConfigs`

---

### GET `/llmconfigs/:id`
**Description**: Get LLM configuration by ID

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `READ:LLM_CONFIG:SELF`

**Payload**: None

**Response**: LLM config object

**Controller**: [user.llmconfigs.controller.ts](../../node-backend/src/controllers/user.llmconfigs.controller.ts) - `getLLMConfigById`

---

### PUT `/llmconfigs/:id`
**Description**: Update LLM configuration

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `UPDATE:LLM_CONFIG:SELF`
- `validateRequest` - Validates update data

**Payload**: [UpdateLLMConfigSchema](../../node-backend/src/schemas/llmconfig.ts) (partial)

**Response**: Updated LLM config object

**Controller**: [user.llmconfigs.controller.ts](../../node-backend/src/controllers/user.llmconfigs.controller.ts) - `updateLLMConfig`

---

### DELETE `/llmconfigs/:id`
**Description**: Delete LLM configuration

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `DELETE:LLM_CONFIG:SELF`

**Payload**: None

**Response**: Success message

**Controller**: [user.llmconfigs.controller.ts](../../node-backend/src/controllers/user.llmconfigs.controller.ts) - `deleteLLMConfig`

---

## Help Routes

Base: `/api/v1/help`

### POST `/help`
**Description**: Create a help ticket

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `CREATE:HELP:SELF`
- `validateRequest` - Validates ticket data

**Payload**: [CreateHelpSchema](../../node-backend/src/schemas/help.ts)
```typescript
{
  subject: string,
  description: string,
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
}
```

**Response**: Created help ticket object

**Controller**: [user.help.controller.ts](../../node-backend/src/controllers/user.help.controller.ts) - `createHelp`

---

### GET `/help`
**Description**: Get user's help tickets

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `READ:HELP:SELF`

**Payload**: None

**Response**: Paginated list of user's help tickets

**Controller**: [user.help.controller.ts](../../node-backend/src/controllers/user.help.controller.ts) - `getMyHelp`

---

### GET `/help/:id`
**Description**: Get help ticket by ID

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `READ:HELP:SELF`

**Payload**: None

**Response**: Help ticket object

**Controller**: [user.help.controller.ts](../../node-backend/src/controllers/user.help.controller.ts) - `getHelpById`

---

### POST `/help/:id/reply`
**Description**: Reply to help ticket

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `UPDATE:HELP:SELF`
- `validateRequest` - Validates reply

**Payload**: [ReplyHelpSchema](../../node-backend/src/schemas/help.ts)
```typescript
{
  message: string
}
```

**Response**: Updated help ticket with reply

**Controller**: [user.help.controller.ts](../../node-backend/src/controllers/user.help.controller.ts) - `replyToHelp`

---

## Contact Us Routes

Base: `/api/v1/contact-us`

### POST `/contact-us`
**Description**: Submit a contact form (**Public - No authentication required**)

**Middlewares**:
- `validateRequest` - Validates contact form data

**Payload**: [CreateContactUsSchema](../../node-backend/src/schemas/contactus.ts)
```typescript
{
  name: string,
  email: string,
  subject: string,
  message: string
}
```

**Response**: Contact submission object

**Controller**: [contactus.controller.ts](../../node-backend/src/controllers/contactus.controller.ts) - `createContactUs`

---

## Admin - Users Routes

Base: `/api/v1/admin/users`

### GET `/admin/users`
**Description**: Get all users with pagination and search

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `READ:USER:ALL`

**Query Parameters**:
- `page`, `limit`
- `search` (searches email/name)
- `role` (filter by role)
- `isActive` (filter by status)

**Response**: Paginated list of users

**Controller**: [admin.users.controller.ts](../../node-backend/src/controllers/admin.users.controller.ts) - `getUsers`

---

### POST `/admin/users`
**Description**: Create a new user

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `CREATE:USER:ALL`
- `validateRequest` - Validates user data

**Payload**: [CreateUserSchema](../../node-backend/src/schemas/user.ts)

**Response**: Created user object

**Controller**: [admin.users.controller.ts](../../node-backend/src/controllers/admin.users.controller.ts) - `createUser`

---

### GET `/admin/users/:id`
**Description**: Get user by ID

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `READ:USER:ALL`

**Payload**: None

**Response**: User object with roles and permissions

**Controller**: [admin.users.controller.ts](../../node-backend/src/controllers/admin.users.controller.ts) - `getUserById`

---

### PUT `/admin/users/:id/roles`
**Description**: Update user roles

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `UPDATE:USER:ALL`
- `validateRequest` - Validates role IDs

**Payload**: [UpdateUserRoleSchema](../../node-backend/src/schemas/user.ts)
```typescript
{
  roleIds: string[]
}
```

**Response**: Updated user object

**Controller**: [admin.users.controller.ts](../../node-backend/src/controllers/admin.users.controller.ts) - `updateUserRoles`

---

## Admin - Roles Routes

Base: `/api/v1/admin/roles`

All routes require authentication (applied globally to router).

### GET `/admin/roles/permissions`
**Description**: Get available permissions (resources and actions)

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `READ:ROLE:ALL`

**Payload**: None

**Response**: List of resources and actions for permission building

**Controller**: [admin.roles.controller.ts](../../node-backend/src/controllers/admin.roles.controller.ts) - `getPermissions`

---

### GET `/admin/roles`
**Description**: Get all roles with pagination

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `READ:ROLE:ALL`

**Payload**: None

**Response**: Paginated list of roles with search

**Controller**: [admin.roles.controller.ts](../../node-backend/src/controllers/admin.roles.controller.ts) - `getRoles`

---

### POST `/admin/roles`
**Description**: Create a new role

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `CREATE:ROLE:ALL`
- `validateRequest` - Validates role data

**Payload**: [CreateRoleSchema](../../node-backend/src/schemas/role.ts)
```typescript
{
  name: string,
  description?: string,
  permissionIds: string[]
}
```

**Response**: Created role object

**Controller**: [admin.roles.controller.ts](../../node-backend/src/controllers/admin.roles.controller.ts) - `createRole`

---

### GET `/admin/roles/:id`
**Description**: Get role by ID with permissions populated

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `READ:ROLE:ALL`

**Payload**: None

**Response**: Role object with permissions array

**Controller**: [admin.roles.controller.ts](../../node-backend/src/controllers/admin.roles.controller.ts) - `getRoleById`

---

### PUT `/admin/roles/:id`
**Description**: Update role

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `UPDATE:ROLE:ALL`
- `validateRequest` - Validates update data

**Payload**: [UpdateRoleSchema](../../node-backend/src/schemas/role.ts) (partial)

**Response**: Updated role object

**Controller**: [admin.roles.controller.ts](../../node-backend/src/controllers/admin.roles.controller.ts) - `updateRole`

---

### DELETE `/admin/roles/:id`
**Description**: Delete role

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `DELETE:ROLE:ALL`

**Payload**: None

**Response**: Success message

**Controller**: [admin.roles.controller.ts](../../node-backend/src/controllers/admin.roles.controller.ts) - `deleteRole`

---

## Admin - Contact Us Routes

Base: `/api/v1/admin/contact-us`

All routes require authentication (applied globally to router).

### GET `/admin/contact-us`
**Description**: Get all contact submissions with filters

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `READ:CONTACT_US:ALL`
- `validateRequest` - Validates query params

**Query Parameters**:
- `page`, `limit`
- `status` (PENDING/IN_PROGRESS/RESOLVED)

**Response**: Paginated list of contact submissions

**Controller**: [admin.contactus.controller.ts](../../node-backend/src/controllers/admin.contactus.controller.ts) - `getContactUsSubmissions`

---

### GET `/admin/contact-us/:id`
**Description**: Get contact submission by ID

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `READ:CONTACT_US:ALL`

**Payload**: None

**Response**: Contact submission object

**Controller**: [admin.contactus.controller.ts](../../node-backend/src/controllers/admin.contactus.controller.ts) - `getContactUsById`

---

### PATCH `/admin/contact-us/:id/status`
**Description**: Update contact submission status

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `UPDATE:CONTACT_US:ALL`
- `validateRequest` - Validates status update

**Payload**: [UpdateContactUsStatusSchema](../../node-backend/src/schemas/contactus.ts)
```typescript
{
  status: "PENDING" | "IN_PROGRESS" | "RESOLVED",
  notes?: string
}
```

**Response**: Updated contact submission

**Controller**: [admin.contactus.controller.ts](../../node-backend/src/controllers/admin.contactus.controller.ts) - `updateContactUsStatus`

---

## Admin - Help Routes

Base: `/api/v1/admin/help`

### GET `/admin/help`
**Description**: Get all help tickets (admin view)

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `READ:HELP:ALL`

**Query Parameters**:
- `page`, `limit`
- `status` (OPEN/IN_PROGRESS/RESOLVED/CLOSED)
- `priority` (LOW/MEDIUM/HIGH/URGENT)

**Response**: Paginated list of all help tickets

**Controller**: [admin.help.controller.ts](../../node-backend/src/controllers/admin.help.controller.ts) - `getAllHelpAdmin`

---

### GET `/admin/help/:id`
**Description**: Get help ticket by ID (admin view)

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `READ:HELP:ALL`

**Payload**: None

**Response**: Help ticket object with user details

**Controller**: [admin.help.controller.ts](../../node-backend/src/controllers/admin.help.controller.ts) - `getHelpByIdAdmin`

---

### POST `/admin/help/:id/reply`
**Description**: Reply to help ticket as admin

**Middlewares**:
- `authenticate` - Verifies JWT token
- `authorize` - Checks permission: `UPDATE:HELP:ALL`
- `validateRequest` - Validates reply

**Payload**: [ReplyHelpSchema](../../node-backend/src/schemas/help.ts)
```typescript
{
  message: string
}
```

**Response**: Updated help ticket with admin reply

**Controller**: [admin.help.controller.ts](../../node-backend/src/controllers/admin.help.controller.ts) - `replyToHelpAdmin`

---

## Admin - Stats Routes

Base: `/api/v1/admin/stats`

### GET `/admin/stats`
**Description**: Get admin statistics with date range filters

**Middlewares**:
- `authenticate` - Verifies JWT token
- `validateRequest` - Validates date range query params
- `authorize` - Checks permission: `READ:ADMIN_STATS:ALL`

**Query Parameters**:
- `startDate` (optional: ISO date string)
- `endDate` (optional: ISO date string)

**Response**: Admin statistics
```typescript
{
  totalUsers: number,
  activeUsers: number,
  totalChatbots: number,
  publicChatbots: number,
  totalDocuments: number,
  totalConversations: number,
  totalMessages: number,
  usageStats: {
    totalTokensUsed: number,
    llmInputTokens: number,
    llmOutputTokens: number
  }
}
```

**Controller**: [admin.stats.controller.ts](../../node-backend/src/controllers/admin.stats.controller.ts) - `getStats`

---

## Public Routes

These routes do **NOT** require authentication.

### Public - Chat Routes

Base: `/api/v1/public/chat`

#### GET `/public/chat/:chatbotId`
**Description**: Get public chatbot details

**Middlewares**: None

**Payload**: None

**Response**: Public chatbot details (only PUBLIC chatbots accessible)

**Controller**: [public.chats.controller.ts](../../node-backend/src/controllers/public.chats.controller.ts) - `getChatbot`

---

#### POST `/public/chat/:sessionId/:chatbotId/start`
**Description**: Start a public conversation (session-based, no auth)

**Middlewares**: None

**Payload**: None

**Response**: Conversation ID and initial messages

**Controller**: [public.chats.controller.ts](../../node-backend/src/controllers/public.chats.controller.ts) - `startConversation`

---

#### POST `/public/chat/:sessionId/:conversationId/message`
**Description**: Send message to public conversation

**Middlewares**:
- `validateRequest` - Validates message

**Payload**: [PublicChatRequestSchema](../../node-backend/src/schemas/chat.ts)
```typescript
{
  message: string
}
```

**Response**: Message result with AI response and source documents

**Controller**: [public.chats.controller.ts](../../node-backend/src/controllers/public.chats.controller.ts) - `sendMessage`

---

### Public - Model Configs Routes

Base: `/api/v1/public/model-configs`

#### GET `/public/model-configs`
**Description**: Get available LLM and embedding providers

**Middlewares**: None

**Payload**: None

**Response**: Available providers
```typescript
{
  llmProviders: ["OPENAI", "OLLAMA"],
  embeddingProviders: ["OPENAI", "LOCAL"]
}
```

**Controller**: [public.modelconfigs.controller.ts](../../node-backend/src/controllers/public.modelconfigs.controller.ts) - `getPublicModelConfigs`

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation failed) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

---

## Rate Limiting

- **Production**: 100 requests / 15 minutes per IP
- **Development**: No rate limiting
- **Response**: 429 status with `Retry-After` header

---

## Summary

**Total Endpoints**: 58

**By Category**:
- Authentication: 7
- Documents: 6
- ChatBots: 7
- Chat: 6
- Dashboard: 1
- LLM Configs: 5
- Help: 4
- Contact Us: 1
- Admin - Users: 4
- Admin - Roles: 6
- Admin - Contact Us: 3
- Admin - Help: 3
- Admin - Stats: 1
- Public - Chat: 3
- Public - Model Configs: 1

All schemas: [src/schemas/](../../node-backend/src/schemas/)
All controllers: [src/controllers/](../../node-backend/src/controllers/)

---

**Last Updated**: 11 January 2026
**Documentation Version**: 1.0.0
