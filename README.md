<div align="center">

<img src="frontend/public/logo.png" alt="SerenAI Logo" width="120" height="120" />

# SerenAI

**AI Chatbot Platform — Build intelligent assistants powered by your own documents**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=flat-square&logo=mongodb)](https://mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)](https://docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

[Features](#-features) • [Demo](#-demo) • [Quick Start](#-quick-start) • [User Guide](#-user-guide) • [Ollama Setup](#-ollama-self-hosted-llm) • [Tech Stack](#-technology-stack)

</div>

---

## What is SerenAI?

SerenAI is a **self-hosted AI chatbot platform** that turns your documents into intelligent conversational assistants. Upload PDFs, Word docs, or text files—and instantly create chatbots that can answer questions about your content using RAG (Retrieval-Augmented Generation).

**What you can do:**

🤖 **Build AI Chatbots** — Create unlimited chatbots, each with its own knowledge base, personality, and appearance. Customize everything from the system prompt to 30+ chatbot-specific theme colors and layout options.

📄 **Document-Powered AI** — Upload documents (PDF, DOCX, TXT) that get automatically chunked and indexed. Your chatbot searches this knowledge base to give accurate, context-aware answers.

🔧 **Bring Your Own LLM** — Use OpenAI's GPT models with your API key, or self-host with Ollama for complete privacy and zero API costs. Configure per-chatbot temperature and token limits.

🌐 **Share Anywhere** — Keep chatbots private, share with specific users, or make them public. Embed on any website or share via direct links—no login required for public bots.

🛡️ **Enterprise Security** — Role-based access control with 50 granular permissions. JWT authentication with refresh tokens, rate limiting, and secure password hashing.

📊 **Admin Dashboard** — Monitor platform usage, manage users and roles, track AI token consumption, and handle support tickets—all from a centralized admin panel.

**Perfect for:** Customer support, internal knowledge bases, documentation assistants, FAQ bots, and any use case where you need AI that knows your content.

---

## 🎥 Watch the SerenAI Demo

[![SerenAI Demo](https://img.youtube.com/vi/vIrKn69FEsY/maxresdefault.jpg)](https://www.youtube.com/watch?v=vIrKn69FEsY)

---

## 🚀 Quick Start

Get SerenAI running in minutes with our automated setup script.

### Prerequisites

- Docker & Docker Compose installed
- `.env` files configured (see below)

### Environment Configuration

Copy the example files and configure:

```bash
cp node-backend/.env.example node-backend/.env
cp frontend/.env.example frontend/.env
```

<details>
<summary><b>📁 Backend Environment</b> (<code>node-backend/.env</code>)</summary>

```bash
# Authentication
# Generate secure random secrets using: openssl rand -base64 32
JWT_ACCESS_TOKEN_SECRET=your-super-secret-jwt-access-key-here-change-in-production
JWT_REFRESH_TOKEN_SECRET=your-super-secret-jwt-refresh-key-here-change-in-production
JWT_ACCESS_TOKEN_EXPIRES_IN=1h
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=12

# OAuth / SSO Configuration
# Google OAuth - Get from: https://console.cloud.google.com/
# IF NOT PROVIDED - GOOGLE SIGN IN ROUTES will not work
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# API Configuration
API_VERSION=v1

# Rate Limiting (optional)
# Maximum number of requests allowed in the time window
RATE_LIMIT_MAX_REQUESTS=100
# Time window in milliseconds (900000 = 15 minutes)
RATE_LIMIT_WINDOW_MS=900000

# Embedding Configuration
# Set to true to use local HuggingFace embeddings, false to use OpenAI embeddings
USE_LOCAL_EMBEDDING=true

# Local Embedding Model (only used if USE_LOCAL_EMBEDDING=true)
# Keep this if u have better CPU (atleast i5 10th Gen) CPU, else choose lighter version from hugging face
EMBEDDING_LOCAL_MODEL=BAAI/bge-base-en

# OpenAI Configuration (only used if USE_LOCAL_EMBEDDING=false)
# Get your API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here
```

</details>

<details>
<summary><b>📁 Frontend Environment</b> (<code>frontend/.env</code>)</summary>

```bash
# Google SSO Configuration
# Get this from: https://console.cloud.google.com/
# Must be the same as backend GOOGLE_CLIENT_ID
# IF NOT PROVIDED - GOOGLE SIGN IN WILL BE HIDDEN
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

</details>

> [!TIP]
> **Quick setup:** For local development without Google SSO, you only need to set the JWT secrets. Everything else has sensible defaults.

### Commands

```bash
# 🔧 Production Mode (Docker containers)
./start.sh

# 💻 Development Mode (Hot-reload)
./start.sh --dev

# 🧹 Fresh Start (Clears database)
./start.sh --fresh

# 🔄 Fresh Development Start
./start.sh --fresh --dev

# 📋 View Logs (Live tail or pull from container)
./logs.sh
```

### Access Points

| Service | URL |
|---------|-----|
| 🌐 **Web App** | http://localhost:3000 |
| 🔌 **API** | http://localhost:5000 |
| 📖 **API Docs** | http://localhost:5000/api-docs |

### First-Time Setup

1. Open http://localhost:3000 in your browser
2. Click **"Get Started"** to create an account
3. Fill in your email, password, first name, and last name
4. Click **"Create account"**

> [!IMPORTANT]
> ### 🔑 Promote Yourself to Admin
> 
> After registering, run this command to get full admin access:
> 
> ```bash
> docker compose exec backend npm run make-admin your@email.com
> ```
> 
> Replace `your@email.com` with the email you registered with.
> Refresh the page after running the command.


---

## 📖 User Guide

### 🔐 Getting Started

**Step 1: Access the Platform**
1. Open http://localhost:3000
2. You'll see the **Landing Page** with navigation: *Features*, *About*, *Contact*, *Login*, *Get Started*

**Step 2: Create an Account**
1. Click **"Get Started"** button in the header (or **"Login"** → **"Create an account"**)
2. Fill the registration form:
   - **First Name** & **Last Name**
   - **Email** — Your email address
   - **Password** — Minimum 8 characters with uppercase, lowercase, and number
   - **Confirm Password**
3. Click **"Create account"**
4. Alternatively, click **"Sign up with Google"** for Google SSO

**Step 3: Login**
1. Click **"Login"** in the header
2. Enter your email and password
3. Click **"Sign in"**
4. You'll be redirected to the **Dashboard** (`/dashboard`)

---

### 📄 1. Document Management

Create and manage your knowledge base — the documents your chatbots will use to answer questions.

**📍 Location:** Sidebar → **Documents** (or go to `/documents`)

#### Creating a Document

1. Click **"Add Document"** button (top right)
2. **Upload a File**: Drag & drop or click to select (PDF, TXT, DOCX supported)
3. Fill in the form:
   - **Name** — Document title (auto-filled from filename)
   - **Description** — Brief summary of the document content
   - **Labels** — Add tags like "FAQ", "Support", "Product" (type and press Enter)
   - **Visibility**:
     - 🔒 **Private** — Only you can use this document
     - 🌐 **Public** — Source excerpts visible to chatbot users
4. Preview the **Chunks** (how the document is split for AI)
5. Click **"Create Document"**

#### Managing Documents

| Action | How To |
|--------|--------|
| **View** | Click any document card to see details and chunks |
| **Edit** | Click ⋮ menu → **Edit** (or click card → Edit button) |
| **Delete** | Click ⋮ menu → **Delete** → Confirm |
| **Search** | Use the search bar to filter by name |
| **Filter by Label** | Click "Filter by Label..." dropdown |
| **Toggle View** | Use Grid/Table toggle (top right) |

**Features at a Glance:**
- 🏷️ Labels for organization and filtering
- 📊 Status tracking: *Pending*, *Indexed*, *Failed*
- 📈 Chunk count displayed per document
- 🔍 Full-text search across all documents

---

### ⚙️ 2. LLM Configuration

Configure AI models before creating chatbots — you need at least one LLM config.

**📍 Location:** Sidebar → **LLM Configs** (or go to `/llmconfigs`)

#### Creating an LLM Configuration

1. Click **"Add Configuration"** button
2. Fill in the form:
   - **Model Name** — e.g., `gpt-4`, `gpt-3.5-turbo`, `llama2`
   - **Provider**: Choose one:
     - **OPENAI** — Cloud-based, requires API key
     - **OLLAMA** — Self-hosted, requires base URL
   - **API Key** (OpenAI only) — Your OpenAI API key
   - **Base URL** (Ollama only) — e.g., `http://localhost:11434`
3. Click **"Create"**

#### Managing LLM Configs

| Action | How To |
|--------|--------|
| **Edit** | Click config card → Edit form appears |
| **Delete** | Click ⋮ menu → **Delete** → Confirm |
| **Search** | Use search bar to find by model name |

**Provider Comparison:**

| Provider | Pros | Cons |
|----------|------|------|
| **OpenAI** | Best quality, no setup | Costs money, external API |
| **Ollama** | Free, private, self-hosted | Requires GPU, slower |

---

### 🤖 3. Chatbot Builder

Create AI chatbots with full customization over behavior and appearance.

**📍 Location:** Sidebar → **Chatbots** (or go to `/chatbots`)

#### Creating a Chatbot

1. Click **"Create Chatbot"** button
2. **Basic Settings Tab:**
   - **Name** — Your chatbot's display name
   - **Visibility**:
     - 🔒 **Private** — Only you can access
     - 👥 **Shared** — Share with specific users
     - 🌐 **Public** — Anyone can chat (no login required)
   - **Documents** — Click "Select Documents" to choose knowledge base
   - **LLM Configuration** — Select from your created configs
   - **System Prompt** — Define AI personality and instructions
   - **View Source Documents** — Toggle to show/hide source citations
   - **Temperature** — Slider 0-2 (0 = precise, 2 = creative)
   - **Max Tokens** — Limit response length

3. **Appearance Tab:**
   - **Logo** — Upload custom chatbot avatar
   - **Theme Presets** — Choose from pre-made themes
   - **Color Customization** (Light & Dark modes):

   | Category | Customizable Colors |
   |----------|---------------------|
   | **Background** | Main background, header, footer |
   | **Chat Bubbles** | AI bubble, user bubble, text colors, borders |
   | **Input** | Text field background, text color, placeholder |
   | **Buttons** | Send button, icon colors |
   | **Accents** | Success, loading, timestamps |
   | **Welcome** | Welcome text, suggested prompts |

   - **Layout Options**:
     - Message bubble radius (0-50px)
     - Input field radius
     - Logo size and border
     - Shadow intensity: None, Small, Medium, Large
     - Loading animation: Dot, Wave, Circle
     - Header separator toggle

4. **Live Preview** — See changes in real-time on the right panel
5. Click **"Create Chatbot"**

#### Managing Chatbots

| Action | How To |
|--------|--------|
| **Chat** | Click 💬 button or ⋮ menu → **Chat** |
| **View** | Click chatbot card to see details |
| **Edit** | Click ⋮ menu → **Edit** |
| **Share** | Click ⋮ menu → **Share** (for Shared visibility) |
| **Copy Public Link** | Click ⋮ menu → **Copy Public Link** (for Public visibility) |
| **Delete** | Click ⋮ menu → **Delete** → Confirm |

#### Sharing Options

| Visibility | How to Share |
|------------|--------------|
| **Private** | Not shareable |
| **Shared** | ⋮ menu → Share → Enter user email → Add |
| **Public** | Copy link: `http://localhost:3000/public-chat/{botId}` |

**Public chatbots** can be:
- Shared on social media
- Embedded in websites via iframe
- Accessed without login

---

### 💬 4. Chat & Conversations

Interact with your chatbots and manage conversation history.

**📍 Location:** Sidebar → **Chats** (or go to `/chats`)

#### Starting a New Conversation

**Option 1: From Chatbots Page**
1. Go to **Chatbots** (`/chatbots`)
2. Click the 💬 chat icon on any chatbot card
3. A new conversation opens automatically

**Option 2: From Chats Page**
1. Go to **Chats** (`/chats`)
2. Click **"+ New Chat"** button
3. You'll be redirected to select a chatbot

#### Using the Chat Interface

1. Type your message in the input field at the bottom
2. Press **Enter** or click the **Send** button
3. View AI responses with **streaming** (real-time typing effect)
4. If enabled, click **"View Sources"** to see which document chunks were used

#### Managing Conversations

| Action | How To |
|--------|--------|
| **Resume** | Click any conversation card |
| **Rename** | Click ⋮ menu → **Rename** → Enter title → Save |
| **Delete** | Click ⋮ menu → **Delete** → Confirm |
| **Search** | Use search bar to find conversations |

#### Public Chat (No Login Required)

1. Create a **Public** chatbot
2. Copy the public link: `http://localhost:3000/public-chat/{botId}`
3. Share anywhere — anyone can chat without an account
4. Each session gets a unique `session_id` for conversation history

---

### 👥 5. Role-Based Access Control (RBAC)

**📍 Location:** Sidebar → **Admin** → **Roles** (or go to `/admin/roles`)

> ⚠️ **Admin access required** — Run `npm run make-admin your@email.com`

#### Default Roles

| Role | Permissions | Can Delete? |
|------|-------------|-------------|
| **Admin** | 26 permissions (platform-wide access) | ❌ Protected |
| **User** | 24 permissions (own resources only) | ❌ Protected |


**📋 Admin Role Permissions (26)**

| # | Permission | Description |
|---|------------|-------------|
| 1 | `create:user:all` | Create new users |
| 2 | `read:user:all` | View all users |
| 3 | `update:user:all` | Update any user |
| 4 | `delete:user:all` | Delete any user |
| 5 | `read:dashboard:all` | View admin dashboard stats |
| 6 | `create:role:all` | Create roles |
| 7 | `read:role:all` | View roles |
| 8 | `update:role:all` | Update roles |
| 9 | `delete:role:all` | Delete roles |
| 10 | `create:plan:all` | Create plans |
| 11 | `read:plan:all` | View all plans |
| 12 | `update:plan:all` | Update plans |
| 13 | `delete:plan:all` | Delete plans |
| 14 | `create:subscription:all` | Create subscriptions |
| 15 | `read:subscription:all` | View all subscriptions |
| 16 | `delete:subscription:all` | Cancel any subscription |
| 17 | `read:admin_stats:all` | View global admin stats |
| 18 | `read:contact_us:all` | View all contact submissions |
| 19 | `update:contact_us:all` | Update contact submission status |
| 20 | `read:help:all` | View all help tickets |
| 21 | `update:help:all` | Reply/Update help tickets |
| 22 | `read:chatbot:all` | View all chatbots |
| 23 | `update:chatbot:all` | Update any chatbot |
| 24 | `delete:chatbot:all` | Delete any chatbot |
| 25 | `read:document:all` | View all documents |
| 26 | `delete:document:all` | Delete any document |

> **Note:** Admin users also have the **User** role assigned by default. A user can have multiple roles, and an admin can remove roles from any user.

**📋 User Role Permissions (24)**

| # | Permission | Description |
|---|------------|-------------|
| 1 | `read:profile:self` | View own profile |
| 2 | `update:profile:self` | Update own profile |
| 3 | `read:dashboard:self` | View user dashboard stats |
| 4 | `create:chatbot:self` | Create chatbots |
| 5 | `read:chatbot:self` | View own chatbots |
| 6 | `update:chatbot:self` | Update own chatbots |
| 7 | `delete:chatbot:self` | Delete own chatbots |
| 8 | `create:document:self` | Create documents |
| 9 | `read:document:self` | View own documents |
| 10 | `update:document:self` | Update own documents |
| 11 | `delete:document:self` | Delete own documents |
| 12 | `create:chat:self` | Start new chat |
| 13 | `read:chat:self` | Read own chats |
| 14 | `update:chat:self` | Send message |
| 15 | `delete:chat:self` | Delete own chat |
| 16 | `create:help:self` | Create help ticket |
| 17 | `read:help:self` | View own help tickets |
| 18 | `update:help:self` | User reply to own help ticket |
| 19 | `read:subscription:self` | View own subscription |
| 20 | `delete:subscription:self` | Cancel own subscription |
| 21 | `create:llm_config:self` | Create LLM configurations |
| 22 | `read:llm_config:self` | View own LLM configurations |
| 23 | `update:llm_config:self` | Update own LLM configurations |
| 24 | `delete:llm_config:self` | Delete own LLM configurations |

#### Creating a Custom Role

1. Click **"Create Role"** button
2. Fill the form:
   - **Name** — Role identifier (e.g., "content-moderator")
   - **Description** — What this role does
   - **Permissions** — Select from 50 available permissions
3. Click **"Create"**

#### Understanding Permissions

Permissions follow the format: `action:resource:scope`

| Action | Resources | Scopes |
|--------|-----------|--------|
| `create`, `read`, `update`, `delete` | `user`, `role`, `chatbot`, `document`, `llm_config`, `chat`, `dashboard`, `help`, `contact_us`, `admin_stats`, `plan`, `subscription`, `profile` | `self` (own), `all` (platform-wide) |

**Example Permissions:**
- `read:chatbot:self` — View own chatbots
- `read:user:all` — View all users (admin)
- `delete:document:all` — Delete any document (admin)

#### Managing Users & Roles

**📍 Location:** Sidebar → **Admin** → **Users** (or go to `/admin/users`)

1. Find the user in the list
2. Click ⋮ menu → **Change Role**
3. Select roles to assign
4. Click **"Save"**

#### Editing the Default "User" Role

1. Go to **Admin** → **Roles**
2. Click the **"user"** role
3. Add or remove permissions
4. Click **"Update"**

> All new registrations automatically get the "User" role with your configured permissions.

---

### 📊 6. Analytics & Statistics

**📍 Location:** Sidebar → **Dashboard** or **Admin** → **Admin Dashboard**

#### User Dashboard (`/dashboard`)

Available to all logged-in users:
- 📊 **Total Documents** — Number of documents created
- 🤖 **Active Chatbots** — Number of chatbots
- 💬 **Conversations** — Total chat conversations
- Quick action cards to navigate the platform

#### Admin Dashboard (`/admin`)

Available to users with admin permissions:
- 👥 **Total Users** — Platform user count
- 🤖 **Total Chatbots** — All chatbots on platform
- 💬 **Total Conversations** — Platform-wide conversations
- 🔐 **Total Roles** — Number of roles configured

#### AI Usage Statistics

**📍 Location:** Admin Dashboard → **AI Usage Stats**

Track token consumption and costs:

| Event Type | Description |
|------------|-------------|
| `CREATE_DOCUMENT_INDEX` | Tokens used when indexing document chunks |
| `QUERY_DOCUMENT` | Tokens for semantic search queries |
| `LLM_INPUT` | Prompt tokens sent to AI model |
| `LLM_OUTPUT` | Response tokens generated by AI |

Features:
- Filter by date range
- View usage per user
- Track costs per LLM config
- Export data for reporting

---

### 🔧 7. Initial Admin Setup

After deployment, the first user needs admin access:

```bash
# 1. Register an account via the web UI (http://localhost:3000/auth/register)

# 2. Promote your account to admin
docker compose exec backend npm run make-admin your@email.com

# 3. Refresh your browser — you now have admin access!
```

**What can admins do?**
- ✏️ Edit the default "User" role permissions
- 🛠️ Create custom roles (e.g., "Support Agent", "Content Manager")
- 👥 Manage all users and assign roles
- 📊 View platform-wide statistics and AI usage
- 🗑️ Delete any resource on the platform

---

## 🦙 Ollama (Self-Hosted LLM)

Use **Ollama** for free, private, self-hosted AI — no API costs!

### Why Ollama?

| Feature | OpenAI | Ollama |
|---------|--------|--------|
| 💰 **Cost** | Pay per token | Free |
| 🔒 **Privacy** | Data sent to cloud | 100% local |
| 🌐 **Internet** | Required | Not required |
| ⚡ **Speed** | Fast | Depends on GPU |

### Installation

<details>
<summary><b>🐧 Linux (Ubuntu/Debian)</b></summary>

```bash
# Install Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Start Ollama service
sudo systemctl enable ollama
sudo systemctl start ollama

# Pull a model (example: llama2)
ollama pull llama2

# Verify installation
ollama list
```

</details>

<details>
<summary><b>🍎 macOS</b></summary>

```bash
# Install via Homebrew
brew install ollama

# Start server with Docker access
OLLAMA_HOST=0.0.0.0:11434 ollama serve

# In a new terminal, pull a model
ollama pull llama2
```

</details>

<details>
<summary><b>🪟 Windows (PowerShell)</b></summary>

```powershell
# Set host for Docker access
setx OLLAMA_HOST 0.0.0.0:11434

# Restart terminal, then pull model
ollama pull llama2
ollama list
```

</details>

### Making Ollama Accessible to Docker

**⚠️ IMPORTANT:** By default, Ollama only listens on `127.0.0.1`. To use it with Docker containers, you must expose it on `0.0.0.0`:

#### Linux (Systemd)

```bash
# Edit Ollama service
sudo systemctl edit ollama
```

Add these lines:

```ini
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
```

Then restart:

```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

#### macOS / Windows

Start Ollama with the host environment variable:

```bash
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

### Test Ollama Connection

```bash
# From host
curl http://localhost:11434/api/tags

# From Docker container
docker run --rm --network=host alpine sh -c "apk add curl && curl http://localhost:11434/api/tags"
```

### Using Ollama in SerenAI

1. Go to **LLM Configs** → **+ Add Configuration**
2. Fill in:
   - **Model Name**: `llama2` (or any model you pulled)
   - **Provider**: `OLLAMA`
   - **Base URL**: `http://host.docker.internal:11434` (Docker) or `http://localhost:11434` (dev mode)
3. Click **Create**
4. Use this config when creating chatbots

### Popular Ollama Models

| Model | Size | Use Case |
|-------|------|----------|
| `llama2` | 7B | General purpose |
| `llama2:13b` | 13B | Better quality |
| `mistral` | 7B | Fast, efficient |
| `codellama` | 7B | Code generation |
| `gemma:2b` | 2B | Lightweight |

### ⚠️ Important Rules

- ❌ Never run `sudo ollama serve`
- ✅ Always use `OLLAMA_HOST=0.0.0.0:11434` for Docker access
- ✅ Pull models as the same user running Ollama
- ✅ Only one Ollama server should run at a time

---

## 🛠️ Technology Stack

<div align="center">

<table>
<tr>
<td align="center" width="150">
<img src="docs/logos/langchain.png" alt="LangChain" width="60" height="60"/><br/>
<b>LangChain</b><br/>
<sub>AI Orchestration</sub>
</td>
<td align="center" width="150">
<img src="docs/logos/qdrant.png" alt="Qdrant" width="60" height="60"/><br/>
<b>Qdrant</b><br/>
<sub>Vector Database</sub>
</td>
<td align="center" width="150">
<img src="docs/logos/docker.png" alt="Docker" width="60" height="60"/><br/>
<b>Docker</b><br/>
<sub>Containerization</sub>
</td>
<td align="center" width="150">
<img src="docs/logos/nodejs.svg" alt="Node.js" width="60" height="60"/><br/>
<b>Node.js</b><br/>
<sub>Backend Runtime</sub>
</td>
</tr>
<tr>
<td align="center" width="150">
<img src="docs/logos/nextjs.png" alt="Next.js" width="60" height="60"/><br/>
<b>Next.js</b><br/>
<sub>Frontend Framework</sub>
</td>
<td align="center" width="150">
<img src="docs/logos/openai.svg" alt="OpenAI" width="60" height="60"/><br/>
<b>OpenAI</b><br/>
<sub>LLM Provider</sub>
</td>
<td align="center" width="150">
<img src="docs/logos/ollama.png" alt="Ollama" width="60" height="60"/><br/>
<b>Ollama</b><br/>
<sub>Self-hosted LLM</sub>
</td>
<td align="center" width="150">
<img src="docs/logos/huggingface.png" alt="HuggingFace" width="60" height="60"/><br/>
<b>HuggingFace</b><br/>
<sub>Local Embeddings</sub>
</td>
</tr>
</table>

</div>

**Additional Technologies:**
- 🗄️ **MongoDB** — Document database with replica set support
- 🔒 **JWT** — Secure authentication with access & refresh tokens
- 📝 **Zod** — Runtime type validation
- 🎨 **Tailwind CSS** — Modern styling
- 📊 **Recharts** — Data visualization

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Getting Started

1. Fork the repository
2. Clone your fork
3. Set up development environment:
   ```bash
   ./start.sh --dev
   ```
4. Make your changes
5. Submit a pull request

### 📚 Developer Documentation

For detailed technical documentation, see:

- **Backend**: [docs/backend/content.md](docs/backend/content.md)
  - API reference, database schema, RAG system, authentication
- **Frontend**: [docs/frontend/content.md](docs/frontend/content.md)
  - Components, pages, state management, API integration

### 📋 Contribution Guidelines

> **Important**: With every PR, please update the relevant documentation in `/docs` to keep everything in sync.

- Follow existing code style and patterns
- Add tests for new features
- Update documentation as needed
- Keep commits atomic and well-described

### 🚀 Deployment

See [docs/deployment.md](docs/deployment.md) for complete deployment instructions.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

## 👨‍💻 Author

**Saurav Kumar Srivastava**

[![GitHub](https://img.shields.io/badge/GitHub-S--k--Srivastava-181717?style=flat-square&logo=github)](https://github.com/S-k-Srivastava)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-sksrivastava2002-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/sksrivastava2002/)

---

**Built with ❤️ for the AI community**

[⬆ Back to Top](#serenai)

---

**Last Updated**: 11 January 2026
**Documentation Version**: 1.0.0

</div>
