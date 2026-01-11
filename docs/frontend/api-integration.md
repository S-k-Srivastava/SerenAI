# API Integration Documentation

## Overview

This document explains how the frontend integrates with the backend API, including the HTTP client configuration, service layer organization, authentication handling, and data fetching patterns.

---

## Architecture

### Layered API Integration

```
┌─────────────────────────────────────────┐
│         React Components/Pages          │
│      (UI Layer - User Interaction)      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│     TanStack Query (React Query)        │
│   (Data Fetching & Caching Layer)       │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│          Service Layer                  │
│    (src/lib/api/services/*.ts)          │
│   Business Logic & API Abstraction      │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│        Axios HTTP Client                │
│        (src/lib/api.ts)                 │
│   Request/Response Interceptors         │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│           Backend API                   │
│   http://localhost:5000/api/v1          │
└─────────────────────────────────────────┘
```

---

## HTTP Client Configuration

**File**: [src/lib/api.ts](../../frontend/src/lib/api.ts)

### Axios Instance Setup

```typescript
import axios from 'axios';
import { config } from '@/config/config';

const api = axios.create({
  baseURL: config.apiBaseUrl, // Default: http://localhost:5000/api/v1
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Request Interceptor

Automatically attaches JWT token to requests (except public routes).

```typescript
api.interceptors.request.use(
  (config) => {
    // Skip auth for public chat routes
    if (config.url?.includes('/public/chat/')) {
      return config;
    }

    // Attach Bearer token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);
```

### Response Interceptor

Handles token refresh on 401 errors.

```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Attempt token refresh
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(
          `${config.apiBaseUrl}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken } = response.data.data;

        // Update token in localStorage
        localStorage.setItem('token', accessToken);

        // Dispatch custom event to update AuthContext
        window.dispatchEvent(new Event('token-refresh'));

        // Retry original request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/auth/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### Key Features

1. **Auto Token Attachment**: JWT automatically added to Authorization header
2. **Public Route Detection**: Skips auth for `/public/chat/*` endpoints
3. **Token Refresh**: Automatic refresh on 401 responses
4. **Custom Events**: Dispatches `token-refresh` event for AuthContext sync
5. **Error Handling**: Centralized error handling with proper status codes

---

## Service Layer

**Location**: [src/lib/api/services/](../../frontend/src/lib/api/services/)

The service layer abstracts API calls into logical modules by resource type. Each service returns typed responses using TypeScript interfaces.

### Service File Structure

Each service follows this pattern:

```typescript
import api from '@/lib/api';
import { IApiResponse, IPaginatedResult, ResourceType } from '@/types';

export const resourceService = {
  // List with pagination
  getAll: async (page: number, limit: number, search?: string): Promise<IPaginatedResult<ResourceType>> => {
    const response = await api.get(`/resources`, {
      params: { page, limit, search }
    });
    return response.data;
  },

  // Get by ID
  getById: async (id: string): Promise<IApiResponse<ResourceType>> => {
    const response = await api.get(`/resources/${id}`);
    return response.data;
  },

  // Create
  create: async (data: CreateResourceData): Promise<IApiResponse<ResourceType>> => {
    const response = await api.post(`/resources`, data);
    return response.data;
  },

  // Update
  update: async (id: string, data: UpdateResourceData): Promise<IApiResponse<ResourceType>> => {
    const response = await api.put(`/resources/${id}`, data);
    return response.data;
  },

  // Delete
  delete: async (id: string): Promise<IApiResponse<void>> => {
    const response = await api.delete(`/resources/${id}`);
    return response.data;
  },
};
```

---

## Service Modules

### 1. Auth Service

**File**: [authService.ts](../../frontend/src/lib/api/services/authService.ts)

**Endpoints**:
- `POST /auth/login` - Email/password login
- `POST /auth/register` - User registration
- `POST /auth/google-sso-login` - Google OAuth login
- `POST /auth/google-sso-register` - Google OAuth registration
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update user profile
- `POST /auth/refresh` - Refresh access token

**Methods**:
```typescript
{
  login: (email, password) => Promise<IApiResponse<{user, accessToken, refreshToken}>>
  register: (userData) => Promise<IApiResponse<{user, accessToken, refreshToken}>>
  googleSSOLogin: (googleToken) => Promise<IApiResponse<{user, accessToken, refreshToken}>>
  googleSSORegister: (googleToken) => Promise<IApiResponse<{user, accessToken, refreshToken}>>
  getMe: () => Promise<IApiResponse<User>>
  updateProfile: (data) => Promise<IApiResponse<User>>
}
```

---

### 2. Chatbot Service

**File**: [chatbotService.ts](../../frontend/src/lib/api/services/chatbotService.ts)

**Endpoints**:
- `GET /chatbots` - List chatbots (paginated, searchable)
- `GET /chatbots/{id}` - Get chatbot details
- `GET /public/chat/chatbot/{id}` - Get public chatbot (no auth)
- `POST /chatbots` - Create chatbot
- `PUT /chatbots/{id}` - Update chatbot
- `DELETE /chatbots/{id}` - Delete chatbot
- `POST /chatbots/start-chat` - Start conversation
- `POST /chatbots/share` - Share chatbot with users

**Methods**:
```typescript
{
  getAll: (page, limit, search) => Promise<IPaginatedResult<Chatbot>>
  getById: (id) => Promise<IApiResponse<Chatbot>>
  getPublicChatbotByID: (id) => Promise<IApiResponse<Chatbot>>
  create: (data) => Promise<IApiResponse<Chatbot>>
  update: (id, data) => Promise<IApiResponse<Chatbot>>
  delete: (id) => Promise<IApiResponse<void>>
  startChat: (botId) => Promise<IApiResponse<{conversationId}>>
  share: (botId, userIds) => Promise<IApiResponse<void>>
}
```

---

### 3. Document Service

**File**: [documentService.ts](../../frontend/src/lib/api/services/documentService.ts)

**Endpoints**:
- `GET /documents` - List documents (paginated, searchable, filterable by labels)
- `GET /documents/{id}` - Get document details with chunks
- `POST /documents` - Upload and create document
- `PUT /documents/{id}` - Update document metadata
- `DELETE /documents/{id}` - Delete document
- `GET /documents/labels` - Get all unique labels

**Methods**:
```typescript
{
  getAll: (page, limit, search, labels) => Promise<IPaginatedResult<Document>>
  getById: (id) => Promise<IApiResponse<Document>>
  create: (formData) => Promise<IApiResponse<Document>>
  update: (id, data) => Promise<IApiResponse<Document>>
  delete: (id) => Promise<IApiResponse<void>>
  getLabels: () => Promise<IApiResponse<string[]>>
}
```

---

### 4. Chat Service

**File**: [chatService.ts](../../frontend/src/lib/api/services/chatService.ts)

**Endpoints**:
- `GET /chat/conversations` - List conversations (paginated, searchable)
- `GET /chat/conversation/{id}` - Get conversation with message history
- `POST /chat/conversation/start` - Start new conversation
- `POST /public/chat/conversation/start` - Start public conversation (no auth)
- `POST /chat/send-message` - Send message to chatbot
- `POST /public/chat/send-message` - Send public message (no auth)
- `PUT /chat/conversation/{id}/title` - Update conversation title
- `DELETE /chat/conversation/{id}` - Delete conversation

**Methods**:
```typescript
{
  getAll: (page, limit, search) => Promise<IPaginatedResult<Conversation>>
  getById: (id) => Promise<IApiResponse<Conversation>>
  start: (botId) => Promise<IApiResponse<{conversationId}>>
  startPublic: (botId, sessionId) => Promise<IApiResponse<{conversationId}>>
  sendMessage: (conversationId, message) => Promise<IApiResponse<{message, sources}>>
  sendPublicMessage: (conversationId, message, sessionId) => Promise<IApiResponse<{message, sources}>>
  updateTitle: (id, title) => Promise<IApiResponse<void>>
  delete: (id) => Promise<IApiResponse<void>>
}
```

---

### 5. LLM Config Service

**File**: [llmConfigService.ts](../../frontend/src/lib/api/services/llmConfigService.ts)

**Endpoints**:
- `GET /llmconfigs` - List LLM configurations
- `GET /llmconfigs/{id}` - Get config details
- `POST /llmconfigs` - Create config
- `PUT /llmconfigs/{id}` - Update config
- `DELETE /llmconfigs/{id}` - Delete config

**Methods**:
```typescript
{
  getAll: (page, limit, search) => Promise<IPaginatedResult<LLMConfig>>
  getById: (id) => Promise<IApiResponse<LLMConfig>>
  create: (data) => Promise<IApiResponse<LLMConfig>>
  update: (id, data) => Promise<IApiResponse<LLMConfig>>
  delete: (id) => Promise<IApiResponse<void>>
}
```

---

### 6. User Service (Admin)

**File**: [userService.ts](../../frontend/src/lib/api/services/userService.ts)

**Endpoints**:
- `GET /users` - List all users (admin)
- `GET /users/{id}` - Get user details (admin)
- `POST /users` - Create user (admin)
- `PUT /users/{id}` - Update user (admin)
- `DELETE /users/{id}` - Delete user (admin)

**Methods**:
```typescript
{
  getAll: (page, limit, search) => Promise<IPaginatedResult<User>>
  getById: (id) => Promise<IApiResponse<User>>
  create: (data) => Promise<IApiResponse<User>>
  update: (id, data) => Promise<IApiResponse<User>>
  delete: (id) => Promise<IApiResponse<void>>
}
```

---

### 7. Role Service (Admin)

**File**: [roleService.ts](../../frontend/src/lib/api/services/roleService.ts)

**Endpoints**:
- `GET /roles` - List all roles
- `GET /roles/{id}` - Get role details
- `POST /roles` - Create role
- `PUT /roles/{id}` - Update role
- `DELETE /roles/{id}` - Delete role

**Methods**:
```typescript
{
  getAll: () => Promise<IApiResponse<Role[]>>
  getById: (id) => Promise<IApiResponse<Role>>
  create: (data) => Promise<IApiResponse<Role>>
  update: (id, data) => Promise<IApiResponse<Role>>
  delete: (id) => Promise<IApiResponse<void>>
}
```

---

### 8. Admin Service

**File**: [adminService.ts](../../frontend/src/lib/api/services/adminService.ts)

**Endpoints**:
- `GET /admin/stats` - Get admin dashboard statistics

**Methods**:
```typescript
{
  getStats: () => Promise<IApiResponse<AdminStats>>
}
```

---

### 9. Dashboard Service

**File**: [dashboardService.ts](../../frontend/src/lib/api/services/dashboardService.ts)

**Endpoints**:
- `GET /dashboard/stats` - Get user dashboard statistics

**Methods**:
```typescript
{
  getStats: () => Promise<IApiResponse<DashboardStats>>
}
```

---

### 10. Contact Us Service

**File**: [contactUsService.ts](../../frontend/src/lib/api/services/contactUsService.ts)

**Endpoints**:
- `POST /contact-us` - Submit contact form

**Methods**:
```typescript
{
  create: (data) => Promise<IApiResponse<void>>
}
```

---

### 11. Help Service

**File**: [helpService.ts](../../frontend/src/lib/api/services/helpService.ts)

**Endpoints**:
- `GET /help` - List help tickets/articles
- `POST /help` - Create help ticket

**Methods**:
```typescript
{
  getAll: () => Promise<IApiResponse<HelpTicket[]>>
  create: (data) => Promise<IApiResponse<HelpTicket>>
}
```

---

## API Response Formats

### Standard Response

```typescript
interface IApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
```

**Example**:
```json
{
  "success": true,
  "data": {
    "_id": "123",
    "name": "My Chatbot"
  },
  "message": "Chatbot created successfully"
}
```

---

### Paginated Response

```typescript
interface IPaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**Example**:
```json
{
  "data": [
    {"_id": "1", "name": "Chatbot 1"},
    {"_id": "2", "name": "Chatbot 2"}
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

## Data Fetching with TanStack Query

### Query Pattern

**Usage in Component**:
```typescript
import { useQuery } from '@tanstack/react-query';
import { chatbotService } from '@/lib/api/services/chatbotService';

function ChatbotsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['chatbots', page, search], // Cache key
    queryFn: () => chatbotService.getAll(page, 10, search),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState />;

  return (
    <div>
      <SearchInput value={search} onChange={setSearch} />
      <ResourceGrid data={data.data} />
      <Pagination
        currentPage={page}
        totalPages={data.pagination.totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
```

---

### Mutation Pattern

**Usage in Component**:
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatbotService } from '@/lib/api/services/chatbotService';
import { toast } from 'sonner';

function CreateChatbotForm() {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => chatbotService.create(data),
    onSuccess: () => {
      // Invalidate chatbots cache to refetch
      queryClient.invalidateQueries({ queryKey: ['chatbots'] });
      toast.success('Chatbot created successfully');
      navigate('/chatbots');
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const onSubmit = (data) => {
    createMutation.mutate(data);
  };

  return (
    <Form onSubmit={onSubmit}>
      {/* Form fields */}
      <Button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? 'Creating...' : 'Create Chatbot'}
      </Button>
    </Form>
  );
}
```

---

## Error Handling

### Error Utility

**File**: [src/lib/errorUtils.ts](../../frontend/src/lib/errorUtils.ts)

```typescript
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // Backend error response
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    // Network error
    if (error.message) {
      return error.message;
    }
  }
  // Generic error
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}
```

**Usage**:
```typescript
import { getErrorMessage } from '@/lib/errorUtils';
import { toast } from 'sonner';

try {
  await chatbotService.create(data);
} catch (error) {
  toast.error(getErrorMessage(error));
}
```

---

## Best Practices

### 1. Always Use Service Layer

**❌ Bad** (Direct API call in component):
```typescript
const response = await axios.get('/chatbots');
```

**✅ Good** (Use service method):
```typescript
const response = await chatbotService.getAll(1, 10);
```

---

### 2. Use TanStack Query for Server State

**❌ Bad** (Manual state management):
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  chatbotService.getAll(1, 10).then(res => {
    setData(res.data);
    setLoading(false);
  });
}, []);
```

**✅ Good** (TanStack Query):
```typescript
const { data, isLoading } = useQuery({
  queryKey: ['chatbots'],
  queryFn: () => chatbotService.getAll(1, 10),
});
```

---

### 3. Invalidate Queries After Mutations

```typescript
const mutation = useMutation({
  mutationFn: chatbotService.create,
  onSuccess: () => {
    // Refetch chatbots list
    queryClient.invalidateQueries({ queryKey: ['chatbots'] });
  },
});
```

---

### 4. Handle Loading and Error States

```typescript
const { data, isLoading, error } = useQuery({ /* ... */ });

if (isLoading) return <LoadingState />;
if (error) return <ErrorState message={getErrorMessage(error)} />;
return <DataDisplay data={data} />;
```

---

### 5. Use Toast Notifications

```typescript
import { toast } from 'sonner';

// Success
toast.success('Chatbot created successfully');

// Error
toast.error('Failed to create chatbot');

// Loading
const toastId = toast.loading('Creating chatbot...');
toast.success('Done!', { id: toastId });
```

---

## Query Key Conventions

### Single Resource
```typescript
['chatbot', id]
```

### List with Filters
```typescript
['chatbots', page, limit, search]
```

### Nested Resource
```typescript
['chatbot', botId, 'conversations']
```

### User-Specific Data
```typescript
['user', 'profile']
```

---

## Caching Strategy

### Default Settings

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (garbage collection)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

### Per-Query Customization

```typescript
useQuery({
  queryKey: ['chatbots'],
  queryFn: chatbotService.getAll,
  staleTime: 1 * 60 * 1000, // 1 minute (frequently updated data)
  gcTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: true, // Refetch when user returns to tab
});
```

---

## Public vs Authenticated Endpoints

### Public Endpoints (No Auth)

```typescript
// Public chatbot
chatbotService.getPublicChatbotByID(botId);

// Public chat
chatService.startPublic(botId, sessionId);
chatService.sendPublicMessage(conversationId, message, sessionId);
```

### Authenticated Endpoints

All other endpoints require JWT token (automatically attached by interceptor).

---

## Summary

### Service Modules

| Service | File | Endpoints | Purpose |
|---------|------|-----------|---------|
| Auth | authService.ts | 7 | Authentication & profile |
| Chatbot | chatbotService.ts | 8 | Chatbot management |
| Document | documentService.ts | 6 | Document management |
| Chat | chatService.ts | 8 | Conversations & messaging |
| LLM Config | llmConfigService.ts | 5 | LLM configuration |
| User | userService.ts | 5 | User management (admin) |
| Role | roleService.ts | 5 | Role management (admin) |
| Admin | adminService.ts | 1 | Admin statistics |
| Dashboard | dashboardService.ts | 1 | User dashboard stats |
| Contact Us | contactUsService.ts | 1 | Contact form |
| Help | helpService.ts | 2 | Help tickets |

**Total**: 11 services, 45+ endpoints

---

## Further Resources

- [Pages Documentation](./pages.md) - API usage per page
- [State Management](./state-management.md) - TanStack Query patterns
- [Authentication](./authentication.md) - Auth flow
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Axios Documentation](https://axios-http.com/)

---

**Last Updated**: 11 January 2026
**Documentation Version**: 1.0.0
