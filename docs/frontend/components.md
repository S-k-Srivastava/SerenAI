# Components Documentation

## Overview

This document provides comprehensive documentation for all React components in the SerenAI frontend application. Components are organized by category and include usage examples, props, and integration patterns.

**Total Components**: 80+ components across 10 categories

---

## Table of Contents

1. [UI Components](#ui-components) - Radix-UI wrappers
2. [Layout Components](#layout-components) - App structure
3. [Auth Components](#auth-components) - Authentication
4. [Chat Components](#chat-components) - Chat interface
5. [Dashboard Components](#dashboard-components) - Dashboard UI
6. [Admin Components](#admin-components) - Admin panel
7. [Form Components](#form-components) - Forms & inputs
8. [Common Components](#common-components) - Shared utilities
9. [Landing Components](#landing-components) - Marketing pages
10. [Help Components](#help-components) - Support system

---

## UI Components

**Location**: [src/components/ui/](../../frontend/src/components/ui/)

These are Radix-UI wrapper components with custom styling using Tailwind CSS. They provide accessible, unstyled primitives with consistent design.

### Button

**File**: [button.tsx](../../frontend/src/components/ui/button.tsx)

Versatile button component with multiple variants and sizes.

**Variants**:
- `default` - Primary blue button
- `destructive` - Red for dangerous actions
- `outline` - Outlined button
- `secondary` - Gray secondary button
- `ghost` - Transparent background
- `link` - Text link style
- `gradient` - Gradient background
- `success` - Green success button
- `warning` - Yellow warning button
- `info` - Cyan info button
- `ghost-premium` - Premium ghost style
- `outline-premium` - Premium outlined

**Sizes**: `default`, `sm`, `lg`, `xl`, `icon`, `icon-sm`, `icon-lg`

**Usage**:
```tsx
import { Button } from "@/components/ui/button"

<Button variant="default" size="lg">Click Me</Button>
<Button variant="destructive" onClick={handleDelete}>Delete</Button>
<Button variant="outline" disabled>Disabled</Button>
```

---

### Input

**File**: [input.tsx](../../frontend/src/components/ui/input.tsx)

Text input field with consistent styling.

**Features**:
- Dark/light mode support
- File input styling
- Focus ring states
- Disabled states

**Usage**:
```tsx
import { Input } from "@/components/ui/input"

<Input
  type="email"
  placeholder="Enter email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

---

### Card

**File**: [card.tsx](../../frontend/src/components/ui/card.tsx)

Container component with multiple sub-components.

**Components**: `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`

**Usage**:
```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

---

### Form

**File**: [form.tsx](../../frontend/src/components/ui/form.tsx)

React Hook Form integration with accessibility.

**Components**: `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`

**Usage**:
```tsx
import { useForm } from "react-hook-form"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"

const form = useForm()

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input placeholder="email@example.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </form>
</Form>
```

---

### Dialog

**File**: [dialog.tsx](../../frontend/src/components/ui/dialog.tsx)

Modal dialog component with overlay.

**Components**: `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose`

**Usage**:
```tsx
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <div>Dialog content</div>
  </DialogContent>
</Dialog>
```

---

### Select

**File**: [select.tsx](../../frontend/src/components/ui/select.tsx)

Dropdown select component using Radix-UI.

**Components**: `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`

**Usage**:
```tsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

---

### Badge

**File**: [badge.tsx](../../frontend/src/components/ui/badge.tsx)

Status/label badge component.

**Variants**: `default`, `secondary`, `destructive`, `outline`, `success`, `warning`, `info`, `success-soft`, `warning-soft`, `info-soft`, `destructive-soft`

**Usage**:
```tsx
import { Badge } from "@/components/ui/badge"

<Badge variant="success">Active</Badge>
<Badge variant="destructive">Failed</Badge>
```

---

### Checkbox

**File**: [checkbox.tsx](../../frontend/src/components/ui/checkbox.tsx)

Checkbox input with check icon.

**Usage**:
```tsx
import { Checkbox } from "@/components/ui/checkbox"

<Checkbox
  checked={isChecked}
  onCheckedChange={setIsChecked}
  id="terms"
/>
<label htmlFor="terms">Accept terms</label>
```

---

### Textarea

**File**: [textarea.tsx](../../frontend/src/components/ui/textarea.tsx)

Multi-line text input.

**Usage**:
```tsx
import { Textarea } from "@/components/ui/textarea"

<Textarea
  placeholder="Enter description"
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>
```

---

### Other UI Components

- **Dropdown Menu** - Context menu with submenus
- **Popover** - Floating content popover
- **Slider** - Range slider input
- **Switch** - Toggle switch component
- **Alert** - Alert/notification container
- **Table** - Semantic table with sub-components
- **Label** - Form label with accessibility
- **Skeleton** - Loading placeholder
- **Separator** - Visual divider
- **Tooltip** - Hover tooltip
- **Scroll Area** - Custom scrollbar styling
- **Calendar** - Date picker calendar
- **Command** - Command palette
- **Alert Dialog** - Confirmation dialog
- **Tabs** - Tab navigation

---

## Layout Components

**Location**: [src/components/layout/](../../frontend/src/components/layout/)

### Header

**File**: [Header.tsx](../../frontend/src/components/layout/Header.tsx)

Application header with breadcrumb navigation.

**Props**:
```typescript
{
  title?: string
  subtitle?: string
  avatar?: string
  showStatus?: boolean
  actions?: React.ReactNode
  onMobileMenuToggle?: () => void
  className?: string
}
```

**Features**:
- Dynamic breadcrumb generation from URL
- Icon mapping for routes (Dashboard, Chatbots, Documents, etc.)
- Filters out ID segments from breadcrumb
- Mobile menu toggle support

**Usage**:
```tsx
import { Header } from "@/components/layout/Header"

<Header
  title="Dashboard"
  subtitle="Welcome back"
  onMobileMenuToggle={toggleMenu}
/>
```

---

### Sidebar

**File**: [Sidebar.tsx](../../frontend/src/components/layout/Sidebar.tsx)

Main navigation sidebar with collapsible design.

**Features**:
- Navigation items with icons and permission checking
- Permission-based access control
- Recent chats section
- Chatbot search and selection
- Profile menu with logout
- Responsive collapse/expand

**Navigation Items**:
- Dashboard - `/dashboard`
- Chatbots - `/chatbots`
- Chats - `/chats`
- Documents - `/documents`
- LLM Configs - `/llmconfigs`
- Help Center - `/help`
- Admin - `/admin` (permission-based)
- Account - `/profile`

**Usage**:
Automatically rendered in protected route layout.

---

### DashboardTabLayout

**File**: [DashboardTabLayout.tsx](../../frontend/src/components/layout/DashboardTabLayout.tsx)

Template for dashboard resource pages with search, pagination, and view toggle.

**Props**:
```typescript
{
  title: string
  description?: string
  icon?: React.ElementType
  iconColor?: string
  search?: {
    placeholder: string
    value: string
    onChange: (value: string) => void
  }
  refresh?: {
    onClick: () => void
    isLoading?: boolean
  }
  create?: {
    label: string
    href: string
    permission?: string
  }
  pagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    totalItems: number
  }
  showViewModeToggle?: boolean
  children: React.ReactNode
}
```

**Features**:
- Integrated search bar with debouncing
- Refresh button with loading state
- Create/Add button with permission guard
- Grid/List view toggle
- Pagination controls

**Usage**:
```tsx
import { DashboardTabLayout } from "@/components/layout/DashboardTabLayout"

<DashboardTabLayout
  title="Chatbots"
  description="Manage your AI chatbots"
  icon={Bot}
  iconColor="text-blue-600"
  search={{
    placeholder: "Search chatbots...",
    value: searchQuery,
    onChange: setSearchQuery
  }}
  create={{
    label: "Create Chatbot",
    href: "/chatbots/create",
    permission: "create:chatbot:self"
  }}
  pagination={{
    currentPage: page,
    totalPages: totalPages,
    onPageChange: setPage,
    totalItems: total
  }}
  showViewModeToggle
>
  {/* Resource grid or table */}
</DashboardTabLayout>
```

---

### ThemeToggle

**File**: [ThemeToggle.tsx](../../frontend/src/components/layout/ThemeToggle.tsx)

Light/Dark/System theme switcher.

**Props**:
```typescript
{
  customTheme?: IResolvedTheme // For chatbot branding
}
```

**Features**:
- next-themes integration
- Animated sun/moon icons
- Custom theme color support
- Dropdown menu with system option

---

## Auth Components

**Location**: [src/components/auth/](../../frontend/src/components/auth/)

### PermissionGuard

**File**: [PermissionGuard.tsx](../../frontend/src/components/auth/PermissionGuard.tsx)

Conditional rendering based on user permissions.

**Props**:
```typescript
{
  permission: string // Format: "action:resource:scope"
  children: React.ReactNode
  fallback?: React.ReactNode
}
```

**Usage**:
```tsx
import { PermissionGuard } from "@/components/auth/PermissionGuard"

<PermissionGuard
  permission="read:chatbot:self"
  fallback={<p>You don't have permission</p>}
>
  <ChatbotList />
</PermissionGuard>
```

---

## Chat Components

**Location**: [src/components/chat/](../../frontend/src/components/chat/)

### ChatInterface

**File**: [ChatInterface.tsx](../../frontend/src/components/chat/ChatInterface.tsx)

Main chat UI container with full chat functionality.

**Props**:
```typescript
{
  messages: Message[]
  onSend: (message: string) => void
  loading: boolean
  initialLoading: boolean
  title: string
  onRefresh: () => void
  chatbot: {
    name: string
    theme: object
    logo?: string
  }
  isPublic: boolean
}
```

**Features**:
- Message display with custom theming
- Search functionality with highlighting
- Theme resolution (light/dark)
- Customizable header and input
- Permission guard for sending messages

**Usage**:
```tsx
import { ChatInterface } from "@/components/chat/ChatInterface"

<ChatInterface
  messages={messages}
  onSend={handleSend}
  loading={isSending}
  initialLoading={isLoadingHistory}
  title="Chat with Bot"
  onRefresh={refetchMessages}
  chatbot={chatbotData}
  isPublic={false}
/>
```

---

### ChatMessage

**File**: [ChatMessage.tsx](../../frontend/src/components/chat/ChatMessage.tsx)

Individual message display with source viewer.

**Props**:
```typescript
{
  message: {
    id: string
    role: "user" | "assistant"
    content: string
    sources?: Array<{documentId, documentName, chunkIndex, chunkText}>
    createdAt: date
  }
  searchQuery?: string
  isHighlighted?: boolean
  chatbot: { theme: object }
}
```

**Features**:
- Role-based styling (user/assistant)
- Search highlighting
- Copy to clipboard functionality
- Source viewer modal for referenced documents
- Theme-aware styling

---

### ChatInput

**File**: [ChatInput.tsx](../../frontend/src/components/chat/ChatInput.tsx)

Message input field with send button.

**Props**:
```typescript
{
  onSend: (message: string) => void
  disabled: boolean
  isLoading: boolean
}
```

**Features**:
- Auto-focus management
- Enter to send, Shift+Enter for newline
- Loading state button
- Character count display

---

## Dashboard Components

**Location**: [src/components/dashboard/](../../frontend/src/components/dashboard/)

### StatCard

**File**: [StatCard.tsx](../../frontend/src/components/dashboard/StatCard.tsx)

Display statistics with icon and trend indicator.

**Props**:
```typescript
{
  label: string
  value: string | number
  icon: React.ElementType
  iconBg?: string
  iconColor?: string
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  loading?: boolean
}
```

**Usage**:
```tsx
import { StatCard } from "@/components/dashboard/StatCard"
import { Bot } from "lucide-react"

<StatCard
  label="Total Chatbots"
  value={chatbotCount}
  icon={Bot}
  iconBg="bg-blue-100"
  iconColor="text-blue-600"
  change="+5%"
  changeType="positive"
/>
```

---

### QuickActionCard

**File**: [QuickActionCard.tsx](../../frontend/src/components/dashboard/QuickActionCard.tsx)

Action card linking to resources.

**Props**:
```typescript
{
  href: string
  title: string
  description: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  hoverBorderColor: string
  permission?: string
}
```

**Usage**:
```tsx
import { QuickActionCard } from "@/components/dashboard/QuickActionCard"
import { Plus } from "lucide-react"

<QuickActionCard
  href="/chatbots/create"
  title="Create Chatbot"
  description="Start a new AI chatbot"
  icon={Plus}
  iconBg="bg-blue-100"
  iconColor="text-blue-600"
  hoverBorderColor="border-blue-200"
  permission="create:chatbot:self"
/>
```

---

## Admin Components

**Location**: [src/components/admin/](../../frontend/src/components/admin/)

### UserFormDialog

**File**: [UserFormDialog.tsx](../../frontend/src/components/admin/UserFormDialog.tsx)

Create/edit users (admin only).

**Props**:
```typescript
{
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  initialData?: User // For edit mode
}
```

**Features**:
- Form validation with Zod
- Role selection (multiple roles)
- Password input
- Email validation
- Real-time role loading from API

---

### AIUsageStats

**File**: [AIUsageStats.tsx](../../frontend/src/components/admin/AIUsageStats.tsx)

Display AI usage statistics with charts.

**Features**:
- Recharts integration
- Token usage over time
- User growth metrics
- Admin analytics

---

## Form Components

**Location**: [src/components/forms/](../../frontend/src/components/forms/)

### ChatBotForm

**File**: [ChatBotForm.tsx](../../frontend/src/components/forms/ChatBotForm.tsx)

Create/edit chatbots with full configuration.

**Props**:
```typescript
{
  initialData?: Chatbot
  onSubmit: (data: ChatbotFormData) => void
  isLoading: boolean
  mode: 'create' | 'edit'
}
```

**Features**:
- Basic info: name, description, visibility
- Document selection with ResourceSelectionDialog
- LLM config selection
- Advanced settings: temperature, max tokens
- Theme customization with AppearanceEditor
- Live preview with ChatInterface
- Tab-based UI (General, Documents, Advanced, Appearance)

**Form Fields**:
- Name (required, max 100 chars)
- Description (optional, max 500 chars)
- LLM Config (select from list)
- System Prompt (textarea)
- Documents (multi-select)
- Visibility (radio: Private, Shared, Public)
- Theme Settings (color pickers)

---

### DocumentForm

**File**: [DocumentForm.tsx](../../frontend/src/components/forms/DocumentForm.tsx)

Upload and configure documents.

**Props**:
```typescript
{
  initialData?: Document
  onSubmit: (data: DocumentFormData) => void
  isLoading: boolean
  mode: 'create' | 'edit'
}
```

**Features**:
- File upload with drag-and-drop
- Document metadata (name, description, labels)
- Visibility control
- Semantic chunking with preview
- Progress indication
- Label autocomplete

---

### AppearanceEditor

**File**: [AppearanceEditor.tsx](../../frontend/src/components/forms/AppearanceEditor.tsx)

Customize chatbot theme colors.

**Props**:
```typescript
{
  value: ThemeConfig
  onChange: (theme: ThemeConfig) => void
}
```

**Features**:
- Color picker for all UI elements
- Light/dark theme variants
- Border radius controls
- Icon color customization
- Shadow intensity adjustment
- Loading animation styles

---

## Common Components

**Location**: [src/components/common/](../../frontend/src/components/common/)

### ResourceCard

**File**: [ResourceCard.tsx](../../frontend/src/components/common/ResourceCard.tsx)

Display resource with meta info and actions.

**Props**:
```typescript
{
  title: string
  icon: React.ElementType
  accentColor?: 'primary' | 'success' | 'warning' | 'destructive' | 'info'
  status?: React.ReactNode
  suffix?: React.ReactNode
  metaItems?: Array<{icon, label, value}>
  footer?: React.ReactNode
  actions?: Array<{label, onClick, icon, variant}>
  primaryAction?: {label, onClick}
  onClick?: () => void
  className?: string
}
```

**Usage**:
```tsx
import { ResourceCard } from "@/components/common/ResourceCard"
import { Bot } from "lucide-react"

<ResourceCard
  title="My Chatbot"
  icon={Bot}
  accentColor="primary"
  status={<Badge>Active</Badge>}
  metaItems={[
    {icon: Calendar, label: "Created", value: "Jan 1, 2024"}
  ]}
  actions={[
    {label: "Edit", onClick: handleEdit, icon: Edit},
    {label: "Delete", onClick: handleDelete, icon: Trash, variant: "destructive"}
  ]}
  onClick={() => navigate(`/chatbots/${id}`)}
/>
```

---

### ResourceTable

**File**: [ResourceTable.tsx](../../frontend/src/components/common/ResourceTable.tsx)

Display resources in table format.

**Props**:
```typescript
{
  data: T[]
  columns: Array<{
    header: string
    accessor: keyof T | ((row: T) => React.ReactNode)
    width?: string
  }>
  onRowClick?: (row: T) => void
}
```

**Usage**:
```tsx
import { ResourceTable } from "@/components/common/ResourceTable"

<ResourceTable
  data={chatbots}
  columns={[
    {header: "Name", accessor: "name"},
    {header: "Status", accessor: (row) => <Badge>{row.status}</Badge>},
    {header: "Created", accessor: "createdAt"}
  ]}
  onRowClick={(chatbot) => navigate(`/chatbots/${chatbot.id}`)}
/>
```

---

### Pagination

**File**: [Pagination.tsx](../../frontend/src/components/common/Pagination.tsx)

Navigate paginated results.

**Props**:
```typescript
{
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  maxVisiblePages?: number
  totalItems: number
}
```

**Features**:
- Ellipsis for large page counts
- First/last page navigation
- Item count display
- Loading state

---

### ResourceSelectionDialog

**File**: [ResourceSelectionDialog.tsx](../../frontend/src/components/common/ResourceSelectionDialog.tsx)

Modal for selecting resources (documents, configs).

**Props**:
```typescript
{
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  fetchItems: (page, search) => Promise<{data, pagination}>
  renderItem: (item) => React.ReactNode
  multiSelect?: boolean
  initialSelectedIds?: string[]
  onConfirm: (selectedIds: string[]) => void
}
```

**Features**:
- Paginated search results
- Multi/single select modes
- Custom item rendering
- Debounced search
- Skeleton loading

---

### ConfirmDialog

**File**: [ConfirmDialog.tsx](../../frontend/src/components/common/ConfirmDialog.tsx)

Confirmation for destructive actions.

**Props**:
```typescript
{
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onConfirm: () => void | Promise<void>
  confirmText?: string
  cancelText?: string
  variant?: 'destructive' | 'default'
}
```

**Usage**:
```tsx
import { ConfirmDialog } from "@/components/common/ConfirmDialog"

<ConfirmDialog
  open={isOpen}
  onOpenChange={setIsOpen}
  title="Delete Chatbot"
  description="Are you sure? This action cannot be undone."
  onConfirm={handleDelete}
  confirmText="Delete"
  variant="destructive"
/>
```

---

### ErrorBoundary

**File**: [ErrorBoundary.tsx](../../frontend/src/components/common/ErrorBoundary.tsx)

Catch and display React errors.

**Props**:
```typescript
{
  children: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}
```

**Usage**:
```tsx
import { ErrorBoundary } from "@/components/common/ErrorBoundary"

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

---

### Other Common Components

- **AppLoader** - Full-screen app loading state
- **ChunkViewer** - Display document chunks
- **PageHeader** - Page title and description
- **EmptyState** - Empty state messaging
- **LoadingState** - Loading placeholder
- **StatusBadge** - Status indicator
- **UnauthorizedState** - Permission denied message
- **ShareChatbotDialog** - Share chatbot modal
- **ResourceGrid** - Grid layout for resources
- **ResourceViewer** - Preview resource content
- **MultiSelectFilter** - Multi-select dropdown

---

## Landing Components

**Location**: [src/components/landing/](../../frontend/src/components/landing/)

### Other Landing Components

- **Hero** - Landing page hero section
- **Features** - Feature highlight section
- **About** - About/mission section
- **Contact** - Contact form
- **Footer** - Site footer
- **LandingHeader** - Landing page header/navbar

---

## Help Components

**Location**: [src/components/help/](../../frontend/src/components/help/)

### HelpDetailDialog

**File**: [HelpDetailDialog.tsx](../../frontend/src/components/help/HelpDetailDialog.tsx)

View help ticket details and discussions.

**Props**:
```typescript
{
  open: boolean
  onOpenChange: (open: boolean) => void
  ticketId: string
  onSuccess?: () => void
  isAdmin?: boolean
  canReply?: boolean
}
```

**Features**:
- Message thread display
- Reply composition
- User/admin distinction in messages
- Timestamp formatting
- Ticket loading with Skeleton

---

## Component Patterns

### Permission-Based Access

```tsx
<PermissionGuard permission="create:chatbot:self">
  <Button onClick={createChatbot}>Create Chatbot</Button>
</PermissionGuard>
```

### Form Handling

```tsx
const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: initialData
})

const onSubmit = async (data) => {
  await apiCall(data)
  toast.success("Success!")
}

<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)}>
    {/* Form fields */}
  </form>
</Form>
```

### Dialog Pattern

```tsx
const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button>Open</Button>
  </DialogTrigger>
  <DialogContent>
    {/* Content */}
  </DialogContent>
</Dialog>
```

### Data Fetching

```tsx
const { data, isLoading } = useQuery({
  queryKey: ['chatbots', page],
  queryFn: () => chatbotService.getAll(page)
})

if (isLoading) return <LoadingState />
return <ResourceGrid data={data} />
```

---

## Summary

### Component Statistics

- **UI Components**: 28 (Radix-UI wrappers)
- **Layout Components**: 6
- **Feature Components**: 40+
- **Total**: 70+ components

### Design Principles

1. **Accessibility**: All components use Radix-UI primitives with ARIA attributes
2. **Type Safety**: Full TypeScript support with proper prop types
3. **Composability**: Components designed for composition
4. **Consistency**: Shared design tokens and styling
5. **Responsiveness**: Mobile-first approach
6. **Performance**: Lazy loading and code splitting where applicable

### Best Practices

1. **Import from index**: Use barrel exports where available
2. **Use prop spreading**: `{...props}` for flexibility
3. **Forward refs**: Use `React.forwardRef` for DOM access
4. **Memoization**: Use `React.memo` for expensive components
5. **Custom hooks**: Extract complex logic into hooks

---

## Further Resources

- [Pages Documentation](./pages.md) - Where components are used
- [API Integration](./api-integration.md) - Data fetching patterns
- [State Management](./state-management.md) - State handling
- [Radix-UI Documentation](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Last Updated**: 11 January 2026
**Documentation Version**: 1.0.0
