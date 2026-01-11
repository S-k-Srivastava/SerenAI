# Pages Documentation

Complete documentation of all frontend routes with permissions, components, and APIs.

---

## Public Pages

### [Landing Page](../../frontend/src/app/page.tsx)

**Route**: `/`

**Description**: Marketing landing page showing platform features, hero section, about section, and contact information. Displays SerenAI AI chatbot builder value propositions.

**Components**:
- [LandingHeader](../../frontend/src/components/landing/LandingHeader.tsx)
- [Hero](../../frontend/src/components/landing/Hero.tsx)
- [Features](../../frontend/src/components/landing/Features.tsx)
- [About](../../frontend/src/components/landing/About.tsx)
- [Contact](../../frontend/src/components/landing/Contact.tsx)
- [Footer](../../frontend/src/components/landing/Footer.tsx)

**APIs**: None

---

### [Login](../../frontend/src/app/auth/login/page.tsx)

**Route**: `/auth/login`

**Description**: User authentication page with email/password form and Google SSO button. Supports redirect query parameter for post-login navigation.

**Components**:
- [AuthVisualSection](../../frontend/src/components/auth/AuthVisualSection.tsx)

**APIs**:
- `authService.login(data)` - Authenticate with email/password - [authService.ts](../../frontend/src/lib/api/services/authService.ts)
- `authService.googleSSOLogin(token)` - Google OAuth login - [authService.ts](../../frontend/src/lib/api/services/authService.ts)

---

### [Register](../../frontend/src/app/auth/register/page.tsx)

**Route**: `/auth/register`

**Description**: User registration page with sign-up form and Google SSO option. Two-step SSO flow capturing token then collecting user details.

**Components**:
- [AuthVisualSection](../../frontend/src/components/auth/AuthVisualSection.tsx)

**APIs**:
- `authService.register(data)` - Register with email, password, firstName, lastName - [authService.ts](../../frontend/src/lib/api/services/authService.ts)
- `authService.googleSSORegister(token, firstName, lastName)` - Register via Google SSO - [authService.ts](../../frontend/src/lib/api/services/authService.ts)

---

### [Contact](../../frontend/src/app/contact/page.tsx)

**Route**: `/contact`

**Description**: Public contact form for submitting inquiries with subject, email, and message fields.

**Components**:
- [LandingHeader](../../frontend/src/components/landing/LandingHeader.tsx)
- [Footer](../../frontend/src/components/landing/Footer.tsx)

**APIs**:
- `contactUsService.create(data)` - Submit contact form - [contactUsService.ts](../../frontend/src/lib/api/services/contactUsService.ts)

---

### [Public Chat](../../frontend/src/app/public-chat/[botId]/page.tsx)

**Route**: `/public-chat/[botId]`

**Description**: Public chat interface for publicly shared chatbots. Shows chatbot details and enables messaging without authentication.

**Components**:
- [ChatInterface](../../frontend/src/components/chat/ChatInterface.tsx)
- [LoadingState](../../frontend/src/components/common/LoadingState.tsx)

**APIs**:
- `chatbotService.getPublicChatbotByID(botId)` - Get public chatbot details - [chatbotService.ts](../../frontend/src/lib/api/services/chatbotService.ts)
- `chatService.startPublic(botId)` - Start public conversation - [chatService.ts](../../frontend/src/lib/api/services/chatService.ts)
- `chatService.sendPublicMessage(conversationId, message)` - Send message in public chat - [chatService.ts](../../frontend/src/lib/api/services/chatService.ts)

---

## Protected User Pages

### [Dashboard](../../frontend/src/app/(protected)/dashboard/page.tsx)

**Route**: `/dashboard`

**Description**: Main user dashboard showing statistics like total documents, active chatbots, conversations count, and quick action cards for navigation.

**Components**:
- [StatCard](../../frontend/src/components/dashboard/StatCard.tsx)
- [QuickActionCard](../../frontend/src/components/dashboard/QuickActionCard.tsx)

**APIs**:
- `dashboardService.getStats()` - Get dashboard statistics - [dashboardService.ts](../../frontend/src/lib/api/services/dashboardService.ts)

---

### [Profile](../../frontend/src/app/(protected)/profile/page.tsx)

**Route**: `/profile`

**Description**: User profile and account settings page showing identity card, personal information form with firstName and lastName fields, and security settings placeholder.

**Components**: None specific

**APIs**:
- `authService.updateProfile(data)` - Update firstName and lastName - [authService.ts](../../frontend/src/lib/api/services/authService.ts)

---

### [Chatbots List](../../frontend/src/app/(protected)/chatbots/page.tsx)

**Route**: `/chatbots`

**Description**: List of user's chatbots with search, pagination, and grid/table view toggle. Shows chatbot status, document count, and actions like chat, edit, share, delete.

**Components**: None specific

**APIs**:
- `chatbotService.getAll({page, limit, search})` - Get paginated chatbots - [chatbotService.ts](../../frontend/src/lib/api/services/chatbotService.ts)
- `chatbotService.startChat(botId)` - Start conversation with chatbot - [chatbotService.ts](../../frontend/src/lib/api/services/chatbotService.ts)
- `chatbotService.delete(chatbotId)` - Delete chatbot - [chatbotService.ts](../../frontend/src/lib/api/services/chatbotService.ts)

---

### [Create Chatbot](../../frontend/src/app/(protected)/chatbots/create/page.tsx)

**Route**: `/chatbots/create`

**Description**: Form to create new chatbot with configuration options including name, visibility, documents, system prompt, theme colors, and LLM config selection.

**Components**:
- [ChatBotForm](../../frontend/src/components/forms/ChatBotForm.tsx)

**APIs**:
- `chatbotService.create(data)` - Create new chatbot - [chatbotService.ts](../../frontend/src/lib/api/services/chatbotService.ts)

---

### [View Chatbot](../../frontend/src/app/(protected)/chatbots/[id]/page.tsx)

**Route**: `/chatbots/[id]`

**Description**: View-only page showing chatbot details including configuration like system prompt, temperature, max tokens, theme colors, visibility, and sharing information.

**Components**: None specific

**APIs**:
- `chatbotService.getById(chatbotId)` - Get chatbot details - [chatbotService.ts](../../frontend/src/lib/api/services/chatbotService.ts)

---

### [Edit Chatbot](../../frontend/src/app/(protected)/chatbots/[id]/edit/page.tsx)

**Route**: `/chatbots/[id]/edit`

**Description**: Edit form for existing chatbot allowing updates to all configuration. Pre-fills form with current chatbot data.

**Components**:
- [ChatBotForm](../../frontend/src/components/forms/ChatBotForm.tsx)

**APIs**:
- `chatbotService.getById(chatbotId)` - Fetch current chatbot data - [chatbotService.ts](../../frontend/src/lib/api/services/chatbotService.ts)
- `chatbotService.update(chatbotId, data)` - Update chatbot configuration - [chatbotService.ts](../../frontend/src/lib/api/services/chatbotService.ts)

---

### [Documents List](../../frontend/src/app/(protected)/documents/page.tsx)

**Route**: `/documents`

**Description**: List of user's documents with search, label filtering, pagination, and grid/table view toggle. Shows document status, chunk count, last modified date.

**Components**: None specific

**APIs**:
- `documentService.getAll({search, page, limit, labels})` - Get paginated documents with label filter - [documentService.ts](../../frontend/src/lib/api/services/documentService.ts)
- `documentService.getLabels()` - Get available labels for filtering - [documentService.ts](../../frontend/src/lib/api/services/documentService.ts)
- `documentService.delete(docId)` - Delete document - [documentService.ts](../../frontend/src/lib/api/services/documentService.ts)

---

### [Create Document](../../frontend/src/app/(protected)/documents/create/page.tsx)

**Route**: `/documents/create`

**Description**: Form to create new document by uploading text content. Supports document name, description, labels, and visibility settings.

**Components**:
- [DocumentForm](../../frontend/src/components/forms/DocumentForm.tsx)

**APIs**:
- `documentService.create(data)` - Create document with chunks, labels, visibility - [documentService.ts](../../frontend/src/lib/api/services/documentService.ts)

---

### [View Document](../../frontend/src/app/(protected)/documents/[id]/page.tsx)

**Route**: `/documents/[id]`

**Description**: View-only page showing document details, metadata like status, chunk count, size, creation date, and searchable chunk viewer.

**Components**:
- [ChunkViewer](../../frontend/src/components/common/ChunkViewer.tsx)

**APIs**:
- `documentService.getById(docId)` - Get document details including chunks - [documentService.ts](../../frontend/src/lib/api/services/documentService.ts)

---

### [Edit Document](../../frontend/src/app/(protected)/documents/[id]/edit/page.tsx)

**Route**: `/documents/[id]/edit`

**Description**: Edit form for document metadata only (name, description, labels, visibility). Content cannot be edited.

**Components**:
- [DocumentForm](../../frontend/src/components/forms/DocumentForm.tsx)

**APIs**:
- `documentService.getById(docId)` - Fetch current document data - [documentService.ts](../../frontend/src/lib/api/services/documentService.ts)
- `documentService.update(docId, data)` - Update document metadata - [documentService.ts](../../frontend/src/lib/api/services/documentService.ts)

---

### [Conversations List](../../frontend/src/app/(protected)/chats/page.tsx)

**Route**: `/chats`

**Description**: List of user's chat conversations with search and pagination. Shows conversation title, chatbot name, message count, last active time. Supports rename and delete.

**Components**: None specific

**APIs**:
- `chatService.getAll({search, page, limit})` - Get paginated conversations - [chatService.ts](../../frontend/src/lib/api/services/chatService.ts)
- `chatService.updateTitle(chatId, {title})` - Rename conversation - [chatService.ts](../../frontend/src/lib/api/services/chatService.ts)
- `chatService.delete(chatId)` - Delete conversation - [chatService.ts](../../frontend/src/lib/api/services/chatService.ts)

---

### [Chat Interface](../../frontend/src/app/(protected)/chat/[id]/page.tsx)

**Route**: `/chat/[id]`

**Description**: Active chat interface showing conversation history and message input. Allows sending messages and receiving AI responses with source documents.

**Components**:
- [ChatInterface](../../frontend/src/components/chat/ChatInterface.tsx)
- [UnauthorizedState](../../frontend/src/components/common/UnauthorizedState.tsx)

**APIs**:
- `chatService.getById(chatId)` - Get conversation details and message history - [chatService.ts](../../frontend/src/lib/api/services/chatService.ts)
- `chatService.sendMessage(chatId, message)` - Send message and get AI response - [chatService.ts](../../frontend/src/lib/api/services/chatService.ts)

---

### [LLM Configs List](../../frontend/src/app/(protected)/llmconfigs/page.tsx)

**Route**: `/llmconfigs`

**Description**: List of LLM configurations with search, pagination, and grid/table view toggle. Shows model name, provider, partial API key, creation date.

**Components**: None specific

**APIs**:
- `llmConfigService.getAll({search, page, limit})` - Get paginated LLM configurations - [llmConfigService.ts](../../frontend/src/lib/api/services/llmConfigService.ts)
- `llmConfigService.delete(configId)` - Delete LLM configuration - [llmConfigService.ts](../../frontend/src/lib/api/services/llmConfigService.ts)

---

### [Create LLM Config](../../frontend/src/app/(protected)/llmconfigs/create/page.tsx)

**Route**: `/llmconfigs/create`

**Description**: Form to create new LLM configuration with model name, provider selection, API key, and optional base URL.

**Components**:
- [LLMConfigForm](../../frontend/src/components/forms/LLMConfigForm.tsx)

**APIs**:
- `llmConfigService.create(data)` - Create LLM configuration - [llmConfigService.ts](../../frontend/src/lib/api/services/llmConfigService.ts)

---

### [Edit LLM Config](../../frontend/src/app/(protected)/llmconfigs/[id]/edit/page.tsx)

**Route**: `/llmconfigs/[id]/edit`

**Description**: Edit form for existing LLM configuration allowing updates to model name, provider, API key, and base URL.

**Components**:
- [LLMConfigForm](../../frontend/src/components/forms/LLMConfigForm.tsx)

**APIs**:
- `llmConfigService.getById(configId)` - Get current LLM configuration - [llmConfigService.ts](../../frontend/src/lib/api/services/llmConfigService.ts)
- `llmConfigService.update(configId, data)` - Update LLM configuration - [llmConfigService.ts](../../frontend/src/lib/api/services/llmConfigService.ts)

---

### [Help Center](../../frontend/src/app/(protected)/help/page.tsx)

**Route**: `/help`

**Description**: Help center where users can create support tickets and view their existing tickets with status and message count.

**Components**:
- [HelpFormDialog](../../frontend/src/components/help/HelpFormDialog.tsx)
- [HelpDetailDialog](../../frontend/src/components/help/HelpDetailDialog.tsx)

**APIs**:
- `helpService.getAll({page, limit, status, search})` - Get paginated help tickets - [helpService.ts](../../frontend/src/lib/api/services/helpService.ts)

---

## Admin Pages

### [Admin Dashboard](../../frontend/src/app/(protected)/admin/page.tsx)

**Route**: `/admin`

**Description**: Admin dashboard showing system overview like total users, chatbots, conversations, roles, and AI usage statistics. Provides quick action cards for admin sections.

**Components**:
- [QuickActionCard](../../frontend/src/components/dashboard/QuickActionCard.tsx)
- [AIUsageStats](../../frontend/src/components/admin/AIUsageStats.tsx)

**APIs**:
- `adminService.getStats(dateFrom, dateTo)` - Get admin statistics for date range - [adminService.ts](../../frontend/src/lib/api/services/adminService.ts)

---

### [User Management](../../frontend/src/app/(protected)/admin/users/page.tsx)

**Route**: `/admin/users`

**Description**: Admin page to manage all users. Shows user list with name, email, roles, status. Allows changing user roles and creating new users.

**Components**:
- [UserRoleDialog](../../frontend/src/components/admin/UserRoleDialog.tsx)
- [UserFormDialog](../../frontend/src/components/admin/UserFormDialog.tsx)

**APIs**:
- `userService.getAll({page, limit, search})` - Get paginated users - [userService.ts](../../frontend/src/lib/api/services/userService.ts)

---

### [Role Management](../../frontend/src/app/(protected)/admin/roles/page.tsx)

**Route**: `/admin/roles`

**Description**: Admin page to manage system roles. Shows role list with name, description, permissions, status. Allows creating, editing, deleting roles (except admin/user roles).

**Components**:
- [RoleFormDialog](../../frontend/src/components/admin/RoleFormDialog.tsx)
- [ConfirmDialog](../../frontend/src/components/common/ConfirmDialog.tsx)

**APIs**:
- `roleService.getAll({page, limit, search})` - Get paginated roles - [roleService.ts](../../frontend/src/lib/api/services/roleService.ts)
- `roleService.delete(roleId)` - Delete role - [roleService.ts](../../frontend/src/lib/api/services/roleService.ts)

---

### [Contact Submissions](../../frontend/src/app/(protected)/admin/contactus/page.tsx)

**Route**: `/admin/contactus`

**Description**: Admin page to manage contact form submissions from users. Shows subject, email, message, status, submission date. Allows viewing details and changing status.

**Components**: None specific (uses generic Dialog component)

**APIs**:
- `contactUsService.getAll({page, limit, search, status})` - Get paginated contact submissions - [contactUsService.ts](../../frontend/src/lib/api/services/contactUsService.ts)
- `contactUsService.updateStatus(submissionId, status)` - Update submission status - [contactUsService.ts](../../frontend/src/lib/api/services/contactUsService.ts)

---

### [Help Management](../../frontend/src/app/(protected)/admin/help/page.tsx)

**Route**: `/admin/help`

**Description**: Admin page to manage support tickets from all users. Shows ticket subject, user, status, message count. Allows viewing details and replying to tickets.

**Components**:
- [HelpDetailDialog](../../frontend/src/components/help/HelpDetailDialog.tsx)

**APIs**:
- `helpService.getAllAdmin({page, limit, status, search})` - Get all help tickets admin view - [helpService.ts](../../frontend/src/lib/api/services/helpService.ts)

---

## Summary

**Total Pages**: 26

| Category | Count |
|----------|-------|
| Public Pages | 5 |
| Protected User Pages | 16 |
| Admin Pages | 5 |

---

**Last Updated**: 11 January 2026
**Documentation Version**: 1.0.0
