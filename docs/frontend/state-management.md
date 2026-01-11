# State Management

## Overview

SerenAI uses a hybrid state management approach combining React Context for global client state and TanStack Query (React Query) for server state management. This document explains all state management patterns, caching strategies, and best practices.

---

## State Management Architecture

```
┌──────────────────────────────────────────────┐
│          Client State (React Context)        │
│  - Auth (user, permissions, tokens)          │
│  - UI Preferences (theme, view mode)         │
│  - Layout State (sidebar, mobile menu)       │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│       Server State (TanStack Query)          │
│  - API Data (chatbots, documents, chats)     │
│  - Caching & Synchronization                 │
│  - Background Refetching                     │
└──────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────┐
│         Form State (react-hook-form)         │
│  - Form inputs & validation                  │
│  - Zod schema integration                    │
└──────────────────────────────────────────────┘
```

---

## React Context (Client State)

### 1. AuthContext

**File**: [src/context/AuthContext.tsx](../../frontend/src/context/AuthContext.tsx)

**Purpose**: Manage authentication and user state globally.

**State**:
```typescript
{
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}
```

**Methods**:
```typescript
{
  login: (email, password) => Promise<void>
  logout: () => void
  hasPermission: (action, resource, scope) => boolean
  updateUser: (user) => void
}
```

**Usage**:
```typescript
import { useAuth } from '@/context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, hasPermission, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user.firstName}!</p>
          {hasPermission('create', 'chatbot', 'self') && (
            <CreateButton />
          )}
        </>
      ) : (
        <LoginPrompt />
      )}
    </div>
  );
}
```

---

### 2. ViewModeContext

**File**: [src/context/ViewModeContext.tsx](../../frontend/src/context/ViewModeContext.tsx)

**Purpose**: Persist grid/table view preference across pages.

**State**:
```typescript
{
  viewMode: 'grid' | 'table'
}
```

**Methods**:
```typescript
{
  setViewMode: (mode: 'grid' | 'table') => void
  toggleViewMode: () => void
}
```

**Persistence**: Saved to `localStorage` with key `viewMode`.

**Usage**:
```typescript
import { useViewMode } from '@/context/ViewModeContext';

function ResourceList() {
  const { viewMode, toggleViewMode } = useViewMode();

  return (
    <div>
      <Button onClick={toggleViewMode}>
        {viewMode === 'grid' ? <List /> : <Grid />}
      </Button>
      {viewMode === 'grid' ? (
        <ResourceGrid data={data} />
      ) : (
        <ResourceTable data={data} />
      )}
    </div>
  );
}
```

---

### 3. LayoutContext

**File**: [src/context/LayoutContext.tsx](../../frontend/src/context/LayoutContext.tsx)

**Purpose**: Manage sidebar and mobile menu state.

**State**:
```typescript
{
  isMobileMenuOpen: boolean
  isSidebarCollapsed: boolean
}
```

**Methods**:
```typescript
{
  toggleMobileMenu: () => void
  toggleSidebar: () => void
}
```

**Usage**:
```typescript
import { useLayout } from '@/context/LayoutContext';

function Header() {
  const { toggleMobileMenu } = useLayout();

  return (
    <header>
      <button onClick={toggleMobileMenu}>
        <Menu />
      </button>
    </header>
  );
}
```

---

### 4. ResourceNameContext

**File**: [src/context/ResourceNameContext.tsx](../../frontend/src/context/ResourceNameContext.tsx)

**Purpose**: Share current resource name between components (e.g., chat page title).

**State**:
```typescript
{
  resourceName: string | null
}
```

**Methods**:
```typescript
{
  setResourceName: (name: string | null) => void
}
```

**Usage**:
```typescript
import { useResourceName } from '@/context/ResourceNameContext';

function ChatPage() {
  const { setResourceName } = useResourceName();

  useEffect(() => {
    setResourceName(chatbot.name);
    return () => setResourceName(null);
  }, [chatbot.name]);

  return <ChatInterface />;
}
```

---

## TanStack Query (Server State)

### Configuration

**File**: [src/providers/QueryProvider.tsx](../../frontend/src/providers/QueryProvider.tsx)

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

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

export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

---

### Query Patterns

#### 1. Basic Query (List Data)

```typescript
import { useQuery } from '@tanstack/react-query';
import { chatbotService } from '@/lib/api/services/chatbotService';

function ChatbotsList() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['chatbots', page, search],
    queryFn: () => chatbotService.getAll(page, 10, search),
    staleTime: 3 * 60 * 1000, // 3 minutes
  });

  if (isLoading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

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

#### 2. Query with Details

```typescript
function ChatbotDetails({ id }: { id: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ['chatbot', id],
    queryFn: () => chatbotService.getById(id),
    staleTime: 5 * 60 * 1000,
    enabled: !!id, // Only run if ID exists
  });

  if (isLoading) return <LoadingState />;

  return <ChatbotViewer chatbot={data.data} />;
}
```

#### 3. Dependent Queries

```typescript
function ChatInterface({ botId }: { botId: string }) {
  // First query: Get chatbot details
  const { data: chatbot } = useQuery({
    queryKey: ['chatbot', botId],
    queryFn: () => chatbotService.getById(botId),
  });

  // Second query: Get conversations (depends on chatbot)
  const { data: conversations } = useQuery({
    queryKey: ['chatbot', botId, 'conversations'],
    queryFn: () => chatService.getAll(1, 10),
    enabled: !!chatbot, // Only run after chatbot loads
  });

  return <ChatUI chatbot={chatbot} conversations={conversations} />;
}
```

---

### Mutation Patterns

#### 1. Create Mutation

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatbotService } from '@/lib/api/services/chatbotService';
import { toast } from 'sonner';

function CreateChatbotForm() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const createMutation = useMutation({
    mutationFn: (data: CreateChatbotData) => chatbotService.create(data),
    onSuccess: (response) => {
      // Invalidate chatbots list to refetch
      queryClient.invalidateQueries({ queryKey: ['chatbots'] });

      toast.success('Chatbot created successfully');
      navigate(`/chatbots/${response.data._id}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const onSubmit = (data: CreateChatbotData) => {
    createMutation.mutate(data);
  };

  return (
    <Form onSubmit={onSubmit}>
      {/* Form fields */}
      <Button
        type="submit"
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? 'Creating...' : 'Create Chatbot'}
      </Button>
    </Form>
  );
}
```

#### 2. Update Mutation

```typescript
function EditChatbotForm({ id, initialData }: EditFormProps) {
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: UpdateChatbotData) =>
      chatbotService.update(id, data),
    onSuccess: () => {
      // Invalidate specific chatbot and list
      queryClient.invalidateQueries({ queryKey: ['chatbot', id] });
      queryClient.invalidateQueries({ queryKey: ['chatbots'] });

      toast.success('Chatbot updated');
      navigate(`/chatbots/${id}`);
    },
  });

  return <Form onSubmit={(data) => updateMutation.mutate(data)} />;
}
```

#### 3. Delete Mutation

```typescript
function DeleteChatbotButton({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => chatbotService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatbots'] });
      toast.success('Chatbot deleted');
      navigate('/chatbots');
    },
  });

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="destructive">
        Delete
      </Button>
      <ConfirmDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        title="Delete Chatbot"
        description="This action cannot be undone."
        onConfirm={() => deleteMutation.mutate()}
      />
    </>
  );
}
```

---

### Query Key Conventions

#### Single Resource
```typescript
['chatbot', id]
['document', id]
['conversation', id]
```

#### List with Filters
```typescript
['chatbots', page, limit, search]
['documents', page, limit, search, labels]
['chats', page, limit, search]
```

#### Nested Resources
```typescript
['chatbot', botId, 'conversations']
['chatbot', botId, 'documents']
```

#### User-Specific
```typescript
['user', 'profile']
```

#### Admin
```typescript
['admin', 'stats']
['admin', 'users', page, search]
```

---

### Cache Invalidation Strategies

#### 1. Invalidate Specific Query

```typescript
// Invalidate single chatbot
queryClient.invalidateQueries({ queryKey: ['chatbot', id] });
```

#### 2. Invalidate All Matches

```typescript
// Invalidate all chatbot-related queries
queryClient.invalidateQueries({ queryKey: ['chatbots'] });
```

#### 3. Invalidate Multiple

```typescript
// After updating chatbot
queryClient.invalidateQueries({ queryKey: ['chatbot', id] });
queryClient.invalidateQueries({ queryKey: ['chatbots'] });
```

#### 4. Set Query Data Manually

```typescript
// Optimistic update
queryClient.setQueryData(['chatbot', id], (old) => ({
  ...old,
  data: { ...old.data, name: 'New Name' }
}));
```

---

## Form State (react-hook-form)

### Basic Form

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { chatbotSchema } from '@/schemas/chatbot.schema';

function ChatbotForm() {
  const form = useForm({
    resolver: zodResolver(chatbotSchema),
    defaultValues: {
      name: '',
      description: '',
      visibility: 'PRIVATE',
    },
  });

  const onSubmit = async (data) => {
    await chatbotService.create(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

### Form with Validation

```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

function RegisterForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });

  return <Form {...form}>{/* Form fields */}</Form>;
}
```

---

## Caching Strategy

### Stale Time vs GC Time

**Stale Time**: How long data is considered fresh
- Default: 5 minutes
- Frequent updates: 1-2 minutes
- Static data: 10-30 minutes

**GC Time** (Garbage Collection): How long to keep unused data in cache
- Default: 10 minutes
- Ensures cache doesn't grow indefinitely

### Example Configuration

```typescript
// Frequently updated data (dashboard stats)
useQuery({
  queryKey: ['dashboard', 'stats'],
  queryFn: dashboardService.getStats,
  staleTime: 1 * 60 * 1000, // 1 minute
  gcTime: 5 * 60 * 1000, // 5 minutes
});

// Rarely changed data (LLM configs)
useQuery({
  queryKey: ['llmconfigs'],
  queryFn: llmConfigService.getAll,
  staleTime: 10 * 60 * 1000, // 10 minutes
  gcTime: 30 * 60 * 1000, // 30 minutes
});
```

---

## Custom Hooks

### useSearchFilter (Debounced Search)

```typescript
import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';

export function useSearchFilter(initialValue = '', delay = 500) {
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce(value, delay);

  return {
    value,
    setValue,
    debouncedValue,
  };
}

// Usage
function SearchableList() {
  const { value, setValue, debouncedValue } = useSearchFilter('', 500);

  const { data } = useQuery({
    queryKey: ['items', debouncedValue],
    queryFn: () => fetchItems(debouncedValue),
  });

  return <SearchInput value={value} onChange={setValue} />;
}
```

---

## Best Practices

### 1. Query Keys Should Be Serializable

✅ **Good**:
```typescript
['chatbots', page, search]
['chatbot', id, { includeDocuments: true }]
```

❌ **Bad**:
```typescript
['chatbots', new Date()] // Not serializable
['chatbot', () => fetchData] // Function
```

---

### 2. Invalidate Queries After Mutations

✅ **Good**:
```typescript
const mutation = useMutation({
  mutationFn: chatbotService.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['chatbots'] });
  },
});
```

❌ **Bad**:
```typescript
// No invalidation, stale data remains
const mutation = useMutation({
  mutationFn: chatbotService.create,
});
```

---

### 3. Use Proper Loading States

✅ **Good**:
```typescript
const { data, isLoading, isFetching } = useQuery({...});

if (isLoading) return <LoadingState />;
return (
  <div>
    {isFetching && <RefreshIndicator />}
    <DataDisplay data={data} />
  </div>
);
```

---

### 4. Handle Errors Gracefully

✅ **Good**:
```typescript
const { data, error } = useQuery({...});

if (error) {
  return <ErrorState message={getErrorMessage(error)} />;
}
```

---

### 5. Use Query Options Wisely

```typescript
// Disable auto-refetch for modals
useQuery({
  queryKey: ['chatbot', id],
  queryFn: () => chatbotService.getById(id),
  refetchOnWindowFocus: false, // Don't refetch when modal opens
  staleTime: Infinity, // Modal data doesn't go stale
});
```

---

## Performance Tips

### 1. Pagination

Always paginate large lists:
```typescript
const { data } = useQuery({
  queryKey: ['chatbots', page],
  queryFn: () => chatbotService.getAll(page, 20),
});
```

### 2. Debounce Search

Prevent excessive API calls:
```typescript
const debouncedSearch = useDebounce(searchValue, 500);

useQuery({
  queryKey: ['chatbots', debouncedSearch],
  queryFn: () => chatbotService.getAll(1, 10, debouncedSearch),
});
```

### 3. Prefetch Data

Load data before navigation:
```typescript
const queryClient = useQueryClient();

const handleRowClick = (id) => {
  // Prefetch before navigation
  queryClient.prefetchQuery({
    queryKey: ['chatbot', id],
    queryFn: () => chatbotService.getById(id),
  });

  navigate(`/chatbots/${id}`);
};
```

### 4. Optimistic Updates

Update UI immediately:
```typescript
const mutation = useMutation({
  mutationFn: chatbotService.update,
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['chatbot', id] });

    // Snapshot previous value
    const previous = queryClient.getQueryData(['chatbot', id]);

    // Optimistically update
    queryClient.setQueryData(['chatbot', id], (old) => ({
      ...old,
      data: { ...old.data, ...newData }
    }));

    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['chatbot', id], context.previous);
  },
  onSettled: () => {
    // Refetch to ensure sync
    queryClient.invalidateQueries({ queryKey: ['chatbot', id] });
  },
});
```

---

## Summary

### State Management Layers

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Client State** | React Context | Auth, UI preferences, layout |
| **Server State** | TanStack Query | API data, caching, sync |
| **Form State** | react-hook-form | Form inputs, validation |

### Query Configuration Defaults

- **Stale Time**: 5 minutes
- **GC Time**: 10 minutes
- **Retry**: 1 attempt
- **Refetch on Focus**: Disabled

### Best Practices Summary

1. Use Context for global client state
2. Use TanStack Query for server data
3. Invalidate queries after mutations
4. Debounce search inputs
5. Handle loading/error states
6. Use proper query keys
7. Configure stale/GC times appropriately

---

## Further Resources

- [API Integration](./api-integration.md) - Service layer usage
- [Components](./components.md) - Component patterns
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)

---

**Last Updated**: 11 January 2026
**Documentation Version**: 1.0.0
