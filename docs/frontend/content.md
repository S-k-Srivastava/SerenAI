# Frontend Documentation - Table of Contents

Welcome to the frontend developer documentation for SerenAI. This guide provides comprehensive information about the Next.js/React frontend architecture, pages, components, API integration, and deployment.

---

## Documentation Structure

### 1. [Overview](./overview.md)
**Essential reading for all frontend developers**

- Architecture and design patterns
- Technology stack breakdown
- Project structure and organization
- State management approach
- Key features summary
- Performance optimizations
- Project statistics

**Start here to understand the frontend architecture and technology choices.**

---

### 2. [Environment Variables](./env.md)
**Configuration reference**

- All environment variables with descriptions
- API configuration
- OAuth/SSO setup
- Production vs development configs
- Best practices for secrets management

**Use this when setting up new environments or configuring OAuth.**

---

### 3. [Pages & Routes](./pages.md)
**Complete pages documentation**

For each page:
- Route path and access requirements
- Required permissions
- APIs used
- Main components
- Functionality overview

Covers all routes:
- Public routes (landing, auth, public chat)
- Protected user routes (dashboard, chatbots, documents, chats)
- Admin routes (users, roles, contact submissions, help management)

**Reference this when implementing new pages or understanding routing.**

---

### 4. [Components](./components.md)
**Component library documentation**

- UI components (Radix-UI wrappers)
- Layout components (Header, Sidebar)
- Feature components (Chat, Forms, Admin)
- Common components (Tables, Grids, Cards)
- Permission-protected components
- Component patterns and best practices

**Essential for understanding reusable components and building consistent UI.**

---

### 5. [API Integration](./api-integration.md)
**API client and service layer**

- Axios configuration and interceptors
- Authentication handling
- Token refresh mechanism
- Service layer organization
- API response formats
- Error handling patterns
- Public vs authenticated endpoints

**Critical for implementing new API calls or debugging integration issues.**

---

### 6. [Authentication & Authorization](./authentication.md)
**Security and access control**

- Login methods (Email/Password, Google OAuth)
- Token management (access + refresh)
- AuthContext implementation
- Permission system (`action:resource:scope`)
- Protected routes
- PermissionGuard component
- SSO integration

**Required reading for implementing secure features and understanding permissions.**

---

### 7. [State Management](./state-management.md)
**Client and server state**

- React Context providers
- TanStack Query (React Query) usage
- Form state with react-hook-form
- Local storage patterns
- Caching strategies
- Query invalidation

**Essential for managing application state effectively.**

---

### 8. [Deployment](./deployment.md)
**Building and deploying the frontend**

- Development mode setup
- Production build process
- Environment configuration
- Docker deployment
- Performance optimization
- Troubleshooting

**Follow this for deploying frontend to different environments.**

---

## Quick Start

### For New Developers

1. **Read [Overview](./overview.md)** - Understand architecture
2. **Setup Environment** - Configure `.env` using [Environment Variables](./env.md)
3. **Explore Pages** - Browse [Pages & Routes](./pages.md) to understand app structure
4. **Study Components** - Review [Components](./components.md) for reusable UI
5. **Learn API** - Check [API Integration](./api-integration.md) for data fetching

### For Feature Development

1. **Identify Route** - Check [Pages & Routes](./pages.md) for similar pages
2. **Check Permissions** - Review [Authentication](./authentication.md) for required permissions
3. **Find Components** - Browse [Components](./components.md) for reusable parts
4. **Implement API** - Use [API Integration](./api-integration.md) patterns
5. **Manage State** - Follow [State Management](./state-management.md) best practices

### For API Consumers

1. **Authentication** - Read [Authentication](./authentication.md) → Login flow
2. **Service Layer** - Check [API Integration](./api-integration.md) → Service files
3. **Type Safety** - Use TypeScript types from `src/types/`

---

## Key Concepts

### Tech Stack
**Framework**: Next.js 16.1.1 (App Router)
**UI Library**: Radix-UI + Tailwind CSS
**State Management**: React Context + TanStack Query
**Forms**: react-hook-form + Zod validation
**HTTP Client**: Axios with interceptors

### Permission Model
- Format: `action:resource:scope`
- Example: `read:chatbot:self` (read own chatbots)
- Example: `read:user:all` (read all users - admin)
- Checked via: `hasPermission()` in AuthContext

### Route Protection
```
Public Routes: /, /auth/*, /contact, /public-chat/*
Protected Routes: /dashboard, /chatbots, /documents, /chats, /llmconfigs
Admin Routes: /admin, /admin/users, /admin/roles, /admin/contactus, /admin/help
```

### API Integration Pattern
1. Define service in `src/lib/api/services/`
2. Use TanStack Query for data fetching
3. Handle loading/error states
4. Invalidate cache on mutations

---

## Common Tasks

### Add New Page

1. **Create Route** - Add file in `src/app/(protected)/` or `src/app/`
2. **Define Types** - Add interfaces in `src/types/`
3. **Add Service** - Create service methods in `src/lib/api/services/`
4. **Implement UI** - Use components from `src/components/`
5. **Add Permissions** - Wrap with PermissionGuard if needed

### Add New Component

1. **Choose Category** - Place in appropriate `src/components/` subfolder
2. **Use Radix-UI** - Leverage existing UI components from `src/components/ui/`
3. **Add Props Types** - Define TypeScript interface
4. **Style with Tailwind** - Use utility classes
5. **Export** - Add to component barrel exports

### Integrate New API

1. **Add Service Method** - In `src/lib/api/services/`
2. **Define Types** - In `src/types/`
3. **Create Query/Mutation** - Use TanStack Query hooks
4. **Handle Errors** - Use toast notifications
5. **Update Cache** - Invalidate queries on success

### Add Permission Check

1. **Import PermissionGuard** - From `src/components/auth/`
2. **Wrap Component** - `<PermissionGuard permission="action:resource:scope">`
3. **Or Use Hook** - `const { hasPermission } = useAuth()`
4. **Show Unauthorized** - Use UnauthorizedState component

---

## Technology Stack Summary

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | Next.js 16.1.1 | React framework with App Router |
| **UI Library** | Radix-UI | Headless accessible components |
| **Styling** | Tailwind CSS 3.4 | Utility-first CSS |
| **State (Client)** | React Context | Global app state |
| **State (Server)** | TanStack Query 5 | Server state & caching |
| **Forms** | react-hook-form | Form state management |
| **Validation** | Zod 4 | Schema validation |
| **HTTP Client** | Axios 1.13 | API requests |
| **Auth** | JWT + OAuth | Token-based auth |
| **Icons** | Lucide React | Icon library |
| **Notifications** | Sonner | Toast notifications |
| **Charts** | Recharts 3.6 | Data visualization |
| **Date Handling** | date-fns 4.1 | Date utilities |
| **Markdown** | react-markdown | Markdown rendering |

---

## Project Statistics

- **Total Pages**: 25+ routes
- **Total Components**: 80+ components
- **API Services**: 14 service modules
- **Type Definitions**: 15+ type files
- **Context Providers**: 4 global contexts
- **Custom Hooks**: 5+ custom hooks
- **Lines of Code**: ~22,000+ LoC

---

## Development Workflow

### Git Workflow
```
main (production)
  ↓
develop (staging)
  ↓
feature/feature-name (development)
```

### Code Review Checklist
- [ ] TypeScript compiles without errors
- [ ] No ESLint warnings
- [ ] Components follow existing patterns
- [ ] Permission checks implemented where needed
- [ ] Forms have validation schemas
- [ ] API calls use service layer
- [ ] Loading and error states handled
- [ ] Mobile responsive
- [ ] Accessibility considerations

### Testing Strategy
- **Component Testing**: Manual testing in development
- **Integration Testing**: Test full user flows
- **Permission Testing**: Test with different user roles
- **Responsive Testing**: Test on mobile/tablet/desktop

---

## Best Practices

### Component Development
1. **Reuse existing components** from `src/components/`
2. **Keep components small** and focused on single responsibility
3. **Use TypeScript** for all props and state
4. **Follow naming conventions** (PascalCase for components)
5. **Add comments** for complex logic

### API Integration
1. **Always use service layer** (don't call axios directly in components)
2. **Handle loading states** with skeleton screens
3. **Show error messages** with toast notifications
4. **Invalidate queries** after mutations
5. **Use proper query keys** for cache management

### State Management
1. **Use React Context** for global app state (auth, theme, layout)
2. **Use TanStack Query** for server data
3. **Use react-hook-form** for form state
4. **Avoid prop drilling** by using context or composition
5. **Keep state close to usage** when possible

### Styling
1. **Use Tailwind utilities** over custom CSS
2. **Follow design tokens** from `src/constants/design-tokens.ts`
3. **Support dark mode** using theme classes
4. **Keep responsive** with Tailwind breakpoints
5. **Test accessibility** with keyboard navigation

---

## Support & Resources

### Documentation Files
- [overview.md](./overview.md) - Architecture overview
- [env.md](./env.md) - Environment variables
- [pages.md](./pages.md) - Pages and routes
- [components.md](./components.md) - Component library
- [api-integration.md](./api-integration.md) - API integration
- [authentication.md](./authentication.md) - Auth & permissions
- [state-management.md](./state-management.md) - State patterns
- [deployment.md](./deployment.md) - Deployment guide

### External Resources
- **Next.js**: https://nextjs.org/docs
- **React**: https://react.dev/
- **Radix-UI**: https://www.radix-ui.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **TanStack Query**: https://tanstack.com/query/latest
- **React Hook Form**: https://react-hook-form.com/
- **Zod**: https://zod.dev/

### Getting Help
- Check relevant documentation section first
- Review browser console for errors
- Test API calls in Network tab
- Verify environment variables in `.env`
- Check permission requirements for protected pages
- Review recent code changes in Git history

---

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Complete authentication system with OAuth
- Chatbot management with theme customization
- Document upload and management
- Chat interface with streaming support
- Admin panel for user/role management
- Public chatbot sharing
- Dark/light theme support
- Responsive mobile design

---

## Contributing

### Code Style
- **Formatting**: Prettier with project config
- **Linting**: ESLint with Next.js rules
- **Naming**:
  - Files: kebab-case for pages, PascalCase for components
  - Components: PascalCase (e.g., `ChatInterface.tsx`)
  - Functions: camelCase (e.g., `hasPermission`)
  - Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)

### Commit Messages
```
feat: Add chatbot theme customization
fix: Resolve token refresh infinite loop
docs: Update API integration guide
refactor: Extract common table component
style: Update button hover states
```

### Pull Request Process
1. Create feature branch from `develop`
2. Implement feature with proper types
3. Test manually on multiple devices
4. Update documentation if needed
5. Run linter and fix warnings
6. Submit PR with description
7. Address review comments
8. Merge to `develop`, then to `main` for release

---

## License

[Your License Here]

---

## Contact

For questions or support, contact the development team or refer to the project repository.

---

**Last Updated**: 11 January 2026
**Documentation Version**: 1.0.0
