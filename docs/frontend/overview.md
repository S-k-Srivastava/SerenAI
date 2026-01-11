# Frontend Overview

## Introduction

SerenAI's frontend is a modern, production-grade web application built with Next.js 16.1.1 using the App Router. It provides a comprehensive interface for managing AI chatbots, documents, conversations, and administrative tasks with role-based access control.

---

## Architecture

### Framework

**Next.js 16.1.1 (App Router)**
- Server-side rendering (SSR) and static site generation (SSG)
- File-based routing with nested layouts
- API routes for server-side logic
- Automatic code splitting
- Built-in image optimization

### Design Pattern

**Component-Based Architecture with Layered Separation**

```
┌─────────────────────────────────────────────────────────┐
│                     App Router (Pages)                   │
│             src/app/**/*.tsx (Routes & Layouts)          │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                   Components Layer                       │
│          Feature Components + UI Components              │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                   Context Providers                      │
│       Auth, ViewMode, Layout, ResourceName Context       │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                    Service Layer                         │
│           src/lib/api/services/ (API Calls)              │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                     HTTP Client                          │
│              Axios (src/lib/api.ts)                      │
└─────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────┐
│                    Backend API                           │
│         http://localhost:5000/api/v1                     │
└─────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (protected)/             # Protected routes group
│   │   │   ├── dashboard/           # User dashboard
│   │   │   ├── chatbots/            # Chatbot management
│   │   │   ├── documents/           # Document management
│   │   │   ├── chats/               # Conversations
│   │   │   ├── chat/[id]/           # Chat interface
│   │   │   ├── llmconfigs/          # LLM configurations
│   │   │   ├── profile/             # User profile
│   │   │   ├── help/                # Help center
│   │   │   └── admin/               # Admin panel
│   │   ├── auth/                    # Authentication pages
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── public-chat/[botId]/     # Public chatbot
│   │   ├── contact/                 # Contact page
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Landing page
│   │
│   ├── components/                  # React components
│   │   ├── ui/                      # Radix-UI wrappers
│   │   ├── layout/                  # Layout components
│   │   ├── auth/                    # Auth components
│   │   ├── chat/                    # Chat components
│   │   ├── admin/                   # Admin components
│   │   ├── dashboard/               # Dashboard components
│   │   ├── forms/                   # Form components
│   │   ├── common/                  # Shared components
│   │   ├── landing/                 # Landing page components
│   │   └── help/                    # Help components
│   │
│   ├── lib/                         # Utilities & APIs
│   │   ├── api.ts                   # Axios client config
│   │   ├── api/services/            # API service layer
│   │   ├── utils.ts                 # Helper functions
│   │   └── errorUtils.ts            # Error handling
│   │
│   ├── context/                     # React Context
│   │   ├── AuthContext.tsx          # Authentication state
│   │   ├── ViewModeContext.tsx      # Grid/Table toggle
│   │   ├── LayoutContext.tsx        # Mobile menu state
│   │   └── ResourceNameContext.tsx  # Current resource name
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useSearchFilter.ts
│   │   ├── useDebounce.ts
│   │   └── useViewMode.ts
│   │
│   ├── types/                       # TypeScript types
│   ├── schemas/                     # Zod validation schemas
│   ├── providers/                   # Provider components
│   ├── constants/                   # App constants
│   └── config/                      # Configuration files
│
├── public/                          # Static assets
├── .env.example                     # Environment template
├── package.json                     # Dependencies
├── tsconfig.json                    # TypeScript config
├── tailwind.config.ts              # Tailwind config
├── next.config.ts                  # Next.js config
└── eslint.config.mjs               # ESLint config
```

---

## Technology Stack

### Core Dependencies

| Library | Version | Purpose |
|---------|---------|---------|
| **next** | 16.1.1 | React framework with SSR, routing, and optimization |
| **react** | 19.2.3 | UI library for building components |
| **react-dom** | 19.2.3 | React rendering for web |
| **typescript** | 5.x | Static type checking |

### UI & Styling

| Library | Version | Purpose |
|---------|---------|---------|
| **tailwindcss** | 3.4.17 | Utility-first CSS framework |
| **@radix-ui/** | Various | Headless, accessible UI components |
| **lucide-react** | Latest | Icon library (1000+ icons) |
| **next-themes** | Latest | Theme switching (light/dark mode) |
| **framer-motion** | 12.23.26 | Animation library |
| **tailwind-merge** | Latest | Merge Tailwind classes without conflicts |
| **clsx** | Latest | Conditional class names |
| **class-variance-authority** | Latest | Component variant styling |

**Radix-UI Components Used:**
- `@radix-ui/react-dialog` - Modal dialogs
- `@radix-ui/react-dropdown-menu` - Dropdown menus
- `@radix-ui/react-select` - Select inputs
- `@radix-ui/react-checkbox` - Checkboxes
- `@radix-ui/react-label` - Form labels
- `@radix-ui/react-slot` - Composition utility
- `@radix-ui/react-tabs` - Tab navigation
- `@radix-ui/react-avatar` - User avatars
- `@radix-ui/react-popover` - Popover menus
- `@radix-ui/react-switch` - Toggle switches
- `@radix-ui/react-toast` - Toast notifications (replaced by sonner)

### State Management

| Library | Version | Purpose |
|---------|---------|---------|
| **@tanstack/react-query** | 5.90.15 | Server state management, caching, and data synchronization |
| **react-hook-form** | 7.x | Form state management with performance optimization |
| **@hookform/resolvers** | 3.x | Form validation resolver for Zod integration |

### Data Fetching & API

| Library | Version | Purpose |
|---------|---------|---------|
| **axios** | 1.13.2 | HTTP client with interceptors for API calls |

### Validation & Forms

| Library | Version | Purpose |
|---------|---------|---------|
| **zod** | 4.1.11 | Schema validation for forms and API data |

### Authentication

| Library | Version | Purpose |
|---------|---------|---------|
| **@react-oauth/google** | Latest | Google OAuth 2.0 integration |
| **@azure/msal-browser** | Latest | Microsoft Azure AD integration |
| **@azure/msal-react** | Latest | Microsoft authentication for React |
| **jwt-decode** | Latest | Decode JWT tokens client-side |

### Date & Time

| Library | Version | Purpose |
|---------|---------|---------|
| **date-fns** | 4.1.0 | Date manipulation and formatting |
| **react-date-range** | Latest | Date range picker component |

### Notifications

| Library | Version | Purpose |
|---------|---------|---------|
| **sonner** | Latest | Toast notification system with beautiful UI |

### Charts & Visualization

| Library | Version | Purpose |
|---------|---------|---------|
| **recharts** | 3.6.0 | Charting library for analytics dashboards |

### Document Processing

| Library | Version | Purpose |
|---------|---------|---------|
| **mammoth** | Latest | Convert Word documents (.docx) to text |
| **pdfjs-dist** | Latest | PDF parsing and text extraction |

### AI & LangChain

| Library | Version | Purpose |
|---------|---------|---------|
| **@langchain/core** | Latest | LangChain core utilities for AI workflows |
| **@langchain/textsplitters** | Latest | Text chunking for document processing |

### Markdown

| Library | Version | Purpose |
|---------|---------|---------|
| **react-markdown** | Latest | Render markdown content in React |

### Development Tools

| Library | Version | Purpose |
|---------|---------|---------|
| **eslint** | 9.x | Code linting for quality and consistency |
| **@eslint/js** | Latest | ESLint JavaScript support |
| **@next/eslint-plugin-next** | Latest | Next.js-specific linting rules |
| **postcss** | Latest | CSS post-processing |
| **autoprefixer** | Latest | Automatic vendor prefixes for CSS |

---

## Key Features

### 1. Authentication & Authorization
- Email/password authentication
- Google OAuth 2.0 integration
- Microsoft SSO (partial implementation)
- JWT token-based sessions
- Automatic token refresh
- Role-based access control (RBAC)
- Permission-based UI rendering

### 2. Chatbot Management
- Create, read, update, delete chatbots
- Configure LLM settings (model, temperature, max tokens)
- Theme customization (colors, fonts, animations)
- Share chatbots with specific users
- Generate public shareable links
- Visibility control (private, shared, public)
- Document attachment to chatbots

### 3. Document Management
- Upload documents (PDF, DOCX, TXT)
- Automatic text extraction and chunking
- Label/tag organization
- Visibility control
- Track indexing status
- View chunk metadata
- Associate documents with chatbots

### 4. Chat Interface
- Real-time conversation with AI chatbots
- Streaming response support
- Message history
- View source documents referenced by AI
- Rename conversations
- Delete conversations
- Public chat without authentication (session-based)

### 5. LLM Configuration
- Support for multiple providers (OpenAI, Ollama)
- Configure API keys and base URLs
- Model selection
- Parameter tuning (temperature, top_p, max tokens)

### 6. Admin Panel
- User management (CRUD)
- Role and permission management
- System statistics dashboard
- AI usage analytics
- Contact form submissions
- Help ticket management

### 7. User Experience
- Dark/Light theme toggle
- Grid/Table view for resource lists
- Search with debouncing
- Pagination
- Mobile-responsive design
- Toast notifications
- Loading skeletons
- Error boundaries
- Accessibility features

---

## State Management Approach

### Client State

**React Context API** for global application state:

1. **AuthContext**
   - User authentication status
   - User profile data
   - Roles and permissions
   - Login/logout methods
   - Permission checking

2. **ViewModeContext**
   - Grid/Table view toggle
   - Persisted in localStorage

3. **LayoutContext**
   - Mobile menu open/close state
   - Sidebar collapse state

4. **ResourceNameContext**
   - Current resource name for page headers

### Server State

**TanStack Query (React Query)** for API data management:

- **Caching**: Automatic caching with configurable stale times
- **Refetching**: Background refetching on window focus (disabled where needed)
- **Pagination**: Query keys with page/search parameters
- **Mutations**: Optimistic updates and cache invalidation
- **Error Handling**: Centralized error handling with toast notifications
- **Loading States**: Built-in loading states for skeleton screens

### Form State

**react-hook-form** for form management:

- Performance optimized with uncontrolled components
- Integrated with Zod for validation
- Real-time validation feedback
- Custom error messages
- Reset and default values

---

## Routing Strategy

### App Router Structure

**Next.js 16.1.1 App Router** with file-based routing:

```
app/
├── layout.tsx                 # Root layout (providers, theme)
├── page.tsx                   # Landing page (/)
├── auth/
│   ├── login/page.tsx         # Login (/auth/login)
│   └── register/page.tsx      # Register (/auth/register)
├── (protected)/               # Protected route group
│   ├── layout.tsx             # Auth guard + sidebar layout
│   ├── dashboard/page.tsx     # Dashboard (/dashboard)
│   ├── chatbots/
│   │   ├── page.tsx           # List (/chatbots)
│   │   ├── create/page.tsx    # Create (/chatbots/create)
│   │   └── [id]/
│   │       ├── page.tsx       # View (/chatbots/[id])
│   │       └── edit/page.tsx  # Edit (/chatbots/[id]/edit)
│   └── admin/
│       ├── page.tsx           # Admin dashboard (/admin)
│       └── users/page.tsx     # User management (/admin/users)
├── public-chat/[botId]/
│   └── page.tsx               # Public chat (/public-chat/[botId])
└── contact/page.tsx           # Contact page (/contact)
```

### Route Protection

**Protected Routes (`/(protected)/` group):**
- Wrapped with authentication check in layout
- Auto-redirect to `/auth/login` if not authenticated
- Permission checks at page level using `PermissionGuard`

**Public Routes:**
- `/` - Landing page
- `/auth/login` - Login
- `/auth/register` - Register
- `/contact` - Contact form
- `/public-chat/[botId]` - Public chatbot interface

---

## API Integration

### HTTP Client Configuration

**Axios Instance** (`src/lib/api.ts`):

```typescript
// Features:
- Base URL: config.apiBaseUrl (default: http://localhost:5000/api/v1)
- Request interceptor: Auto-attach Bearer token
- Response interceptor: Handle 401 (token refresh)
- Public route detection: Skip auth for /public/chat/*
- Error handling: Extract and format error messages
```

### Service Layer

API calls organized by resource in `src/lib/api/services/`:

- `authService.ts` - Authentication endpoints
- `chatbotService.ts` - Chatbot CRUD operations
- `documentService.ts` - Document management
- `chatService.ts` - Chat conversations
- `llmConfigService.ts` - LLM configurations
- `userService.ts` - User management (admin)
- `roleService.ts` - Role management (admin)
- `adminService.ts` - Admin statistics
- `dashboardService.ts` - User dashboard stats
- `contactUsService.ts` - Contact form
- `helpService.ts` - Help tickets

### API Response Format

```typescript
interface IApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

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

---

## Performance Optimizations

### 1. Code Splitting
- Next.js automatic route-based code splitting
- Dynamic imports for heavy components
- Lazy loading for modals and dialogs

### 2. Image Optimization
- Next.js Image component for automatic optimization
- WebP format with fallback
- Responsive images with srcset

### 3. Caching Strategy
- TanStack Query caching with configurable stale times
- LocalStorage for user preferences (view mode, theme)
- Service Worker for offline support (if implemented)

### 4. Search Debouncing
- 500ms debounce on search inputs
- Prevents excessive API calls
- Implemented via custom `useSearchFilter` hook

### 5. Pagination
- Limit results per page (default: 10-20)
- Cached pagination data per page
- Query keys include page number

### 6. Skeleton Screens
- Loading skeletons prevent layout shift
- Better perceived performance
- Consistent loading states across app

### 7. Virtual Scrolling
- Potential for large lists (not yet implemented)
- Can be added with `react-virtual` or `@tanstack/react-virtual`

---

## Security Features

### 1. Authentication
- JWT tokens stored in localStorage
- Automatic token refresh on expiry
- HttpOnly cookie support (if backend configured)

### 2. Authorization
- Permission-based rendering
- `PermissionGuard` component for fine-grained control
- Server-side permission validation (backend)

### 3. XSS Protection
- React's built-in XSS protection
- Sanitize user inputs in forms
- CSP headers (if configured)

### 4. CSRF Protection
- Token-based requests
- Same-origin policy enforcement

### 5. Secure Storage
- Environment variables for secrets
- No hardcoded API keys
- OAuth credentials server-side only

---

## Accessibility

### 1. Radix-UI Accessibility
- Built-in ARIA attributes
- Keyboard navigation support
- Focus management
- Screen reader compatibility

### 2. Semantic HTML
- Proper heading hierarchy
- Semantic elements (nav, main, article)
- Form labels and descriptions

### 3. Keyboard Navigation
- Tab order management
- Skip to content links
- Keyboard shortcuts for common actions

### 4. Color Contrast
- WCAG AA compliance
- Dark mode support
- High contrast mode compatible

---

## Deployment Modes

### Development
```bash
npm run dev
```
- Hot reload enabled
- Source maps for debugging
- Detailed error messages

### Production Build
```bash
npm run build
npm run start
```
- Optimized bundle
- Minified code
- Tree shaking

### Docker Deployment
See [deployment.md](./deployment.md) for Docker configuration using `start.sh`.

---

## Project Statistics

- **Lines of Code**: ~22,000+ LoC
- **Total Components**: 80+ components
- **Total Pages**: 25+ routes
- **API Services**: 14 service modules
- **Type Definitions**: 15+ type files
- **Context Providers**: 4 providers
- **Custom Hooks**: 5+ hooks
- **Bundle Size**: ~500KB (minified + gzipped)

---

## Browser Support

- **Chrome/Edge**: Latest 2 versions
- **Firefox**: Latest 2 versions
- **Safari**: Latest 2 versions
- **Mobile**: iOS Safari, Chrome Android

---

## Further Resources

- [Pages & Routes](./pages.md) - All routes documented
- [Components](./components.md) - Component library
- [API Integration](./api-integration.md) - API patterns
- [Authentication](./authentication.md) - Auth system
- [State Management](./state-management.md) - State patterns
- [Deployment](./deployment.md) - Deployment guide

---

**Last Updated**: 11 January 2026
**Documentation Version**: 1.0.0
