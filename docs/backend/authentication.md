# Authentication & Authorization

## Overview

The backend implements JWT-based authentication with RBAC (Role-Based Access Control) for fine-grained authorization.

**Key Features**:
- JWT access + refresh tokens
- bcrypt password hashing (12 rounds)
- Google OAuth Sign-In
- RBAC with 50 permissions across 13 resources
- Scope-based access control (ALL vs SELF)
- Chatbot-level access control (PUBLIC/PRIVATE/SHARED)

---

## Authentication Flow

### Registration

**Endpoint**: `POST /api/v1/auth/register`

**Process**:
1. Validate input (email, password, firstName, lastName)
2. Check if email already exists → Return 409
3. Hash password with bcrypt (12 rounds)
4. Create user with default "User" role
5. Generate JWT tokens (access + refresh)
6. Return user + tokens

**Password Hashing** ([models/User.ts](../../node-backend/src/models/User.ts)):
```typescript
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(env.BCRYPT_SALT_ROUNDS); // 12 rounds
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```

**Default Role Assignment**:
```typescript
userSchema.pre("save", async function(next) {
  if (this.isNew && this.roles.length === 0) {
    const userRole = await Role.findOne({ name: "User" });
    if (userRole) {
      this.roles = [userRole._id];
    }
  }
  next();
});
```

### Login

**Endpoint**: `POST /api/v1/auth/login`

**Process**:
1. Find user by email (with password field)
2. If not found → Return 401
3. Verify password with bcrypt
4. If invalid → Return 401
5. Check if user is active → Return 403 if inactive
6. Generate JWT tokens
7. Return user + tokens

**Password Verification** ([models/User.ts](../../node-backend/src/models/User.ts)):
```typescript
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};
```

### Google OAuth

**Endpoint**: `POST /api/v1/auth/google`

**Process**:
1. Receive Google access token from frontend
2. Verify token with Google API (`google-auth-library`)
3. Extract user info (email, firstName, lastName)
4. Check if email verified → Return 403 if not
5. Find existing user by email:
   - If exists → Generate tokens
   - If not → Create user with random password + "User" role
6. Return user + tokens

**Note**: SSO users don't need passwords (random hash generated).

---

## JWT Token System

### Access Token

**Purpose**: Short-lived token for API authentication

**Payload**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "permissions": [
    "create:chatbot:self",
    "read:chatbot:self",
    "update:chatbot:self",
    "delete:chatbot:self",
    // ... all user permissions
  ],
  "iat": 1704888000,
  "exp": 1704891600
}
```

**Configuration**:
- **Secret**: `JWT_ACCESS_TOKEN_SECRET` (env)
- **Expiry**: `JWT_ACCESS_TOKEN_EXPIRES_IN` (default: 1h)
- **Algorithm**: HS256

**Generation** ([utils/helpers/auth.ts](../../node-backend/src/utils/helpers/auth.ts)):
```typescript
export const generateAccessToken = async (user: IUser) => {
  const permissions = await getUserPermissions(user);

  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      permissions: permissions.map(p => `${p.action}:${p.resource}:${p.scope}`)
    },
    env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: env.JWT_ACCESS_TOKEN_EXPIRES_IN }
  );
};
```

### Refresh Token

**Purpose**: Long-lived token to obtain new access tokens

**Payload**:
```json
{
  "id": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "iat": 1704888000,
  "exp": 1705492800
}
```

**Configuration**:
- **Secret**: `JWT_REFRESH_TOKEN_SECRET` (env, must differ from access secret)
- **Expiry**: `JWT_REFRESH_TOKEN_EXPIRES_IN` (default: 7d)
- **Algorithm**: HS256

**Refresh Endpoint**: `POST /api/v1/auth/refresh`

**Process**:
1. Verify refresh token signature
2. Extract user ID
3. Load user from database
4. Check if user is active
5. Generate new access token (with current permissions)
6. Return new access token

**Note**: Permissions refreshed on token renewal (supports permission updates without logout).

---

## Authentication Middleware

**File**: [middleware/auth/authenticate.ts](../../node-backend/src/middleware/auth/authenticate.ts)

**Purpose**: Verify JWT and load user for protected routes.

**Process**:
1. Extract token from `Authorization: Bearer <token>` header
2. If missing → Return 401
3. Verify token signature and expiry
4. If invalid/expired → Return 401
5. Extract user ID from token
6. Load user from database
7. If not found → Return 401
8. Check if user is active → Return 403 if inactive
9. Attach user to `req.user = { id, email }`
10. Continue to next middleware

**Usage**:
```typescript
router.get("/profile",
  authenticate,
  getProfile
);
```

**Attached to `req`**:
```typescript
req.user = {
  id: string,
  email: string
};
```

---

## Authorization System

### RBAC Model

**Components**:
- **Actions**: CREATE, READ, UPDATE, DELETE
- **Resources**: PROFILE, USER, CHATBOT, DOCUMENT, LLM_CONFIG, ROLE, DASHBOARD, CHAT, HELP, CONTACT_US, ADMIN_STATS
- **Scopes**: ALL (global access), SELF (own resources only)

**Permission Format**: `action:resource:scope`

**Examples**:
- `create:chatbot:self` - Users create their own chatbots
- `read:user:all` - Admins view all users
- `update:document:self` - Users edit their own documents
- `delete:role:all` - Admins delete any role

### Authorization Middleware

**File**: [middleware/auth/authorize.ts](../../node-backend/src/middleware/auth/authorize.ts)

**Purpose**: Enforce RBAC permissions on routes.

**Signature**:
```typescript
authorize(
  action: ActionEnum,
  resource: ResourceEnum,
  scope: ScopeEnum
)
```

**Process**:
1. Extract user from `req.user` (set by authenticate middleware)
2. Load user's roles from database
3. Load all permissions for those roles
4. Build permission strings: `action:resource:scope`
5. Check if required permission exists in user's permissions
6. If not → Return 403
7. Continue to next middleware

**Usage**:
```typescript
router.post("/documents",
  authenticate,
  authorize(ActionEnum.CREATE, ResourceEnum.DOCUMENT, ScopeEnum.SELF),
  validateRequest(CreateDocumentSchema),
  createDocument
);
```

**Permission Check**:
```typescript
const requiredPermission = `${action}:${resource}:${scope}`;
const hasPermission = userPermissions.some(
  p => `${p.action}:${p.resource}:${p.scope}` === requiredPermission
);
```

**Note**: Exact match required (no scope hierarchy). `ALL` scope doesn't automatically grant `SELF` scope.

---

## Roles & Permissions

### Seeding RBAC

**Script**: `npm run seed:rbac`

**File**: [utils/seeders/rbacSeeder.ts](../../node-backend/src/utils/seeders/rbacSeeder.ts)

**Seeds**:
1. **45 Permissions** - Action × resource × scope combinations
2. **2 Roles** - Admin (26 permissions), User (24 permissions)
3. **Role-Permission Assignments**

**Clear**: `npm run seed:rbac:clear` - Removes all roles and permissions

### Admin Role

**Name**: `Admin`

**Permissions** (27 total):
- **Users**: Full CRUD (ALL scope)
- **Roles**: Full CRUD (ALL scope)
- **ChatBots**: Read ALL (can view all chatbots)
- **Documents**: Read ALL
- **Conversations**: Read ALL
- **Admin Stats**: Read ALL
- **Contact Us**: Full CRUD (ALL scope)
- **Help**: Full CRUD (ALL scope)
- **All Resources**: SELF scope (can manage own resources)

**Use Cases**:
- Platform administrators
- Support staff (view all user data)
- System monitoring

### User Role

**Name**: `User`

**Permissions** (30 total):
- **Profile**: Full CRUD (SELF)
- **ChatBots**: Full CRUD (SELF)
- **Documents**: Full CRUD (SELF)
- **Conversations**: Full CRUD (SELF)
- **LLM Configs**: Full CRUD (SELF)
- **Dashboard**: Read (SELF)
- **Help**: Create, Read (SELF) - Can create tickets, view own tickets
- **Contact Us**: Create (SELF) - Can submit contact forms

**Restrictions**:
- Cannot access other users' data
- Cannot manage roles/permissions
- Cannot view system statistics
- Cannot manage other users' help tickets

**Use Cases**:
- Regular platform users
- Chatbot creators
- Document owners

### Custom Roles

Admins can create custom roles via:
- `POST /api/v1/admin/roles` - Create role
- `PATCH /api/v1/admin/roles/:id` - Update permissions
- `PATCH /api/v1/admin/users/:id/roles` - Assign to users

**Example Custom Role**: "Content Moderator"
- `read:chatbot:all` - View all chatbots
- `read:document:all` - View all documents
- `update:chatbot:all` - Moderate chatbot content
- `delete:chatbot:all` - Remove inappropriate chatbots

---

## ChatBot Access Control

**File**: [middleware/auth/chatBotAccess.ts](../../node-backend/src/middleware/auth/chatBotAccess.ts)

**Purpose**: Additional access checks beyond RBAC for chatbot visibility.

### `verifyChatBotAccess` Middleware

**Usage**: Read/view chatbot operations

**Access Rules**:
1. **Owner**: User is chatbot owner (user_id matches)
2. **Public**: Chatbot visibility is PUBLIC
3. **Shared**: User ID is in `shared_with` array

**Process**:
1. Load chatbot from database
2. Check ownership → Allow if owner
3. Check visibility → Allow if PUBLIC
4. Check shared_with → Allow if user in array
5. Otherwise → Return 403

**Example**:
```typescript
router.get("/chatbots/:id",
  authenticate,
  authorize(ActionEnum.READ, ResourceEnum.CHATBOT, ScopeEnum.SELF),
  verifyChatBotAccess,
  getChatBot
);
```

### `verifyChatBotOwner` Middleware

**Usage**: Modify/delete chatbot operations

**Access Rules**:
- **Only Owner**: User must be chatbot owner

**Process**:
1. Load chatbot from database
2. Check if user_id matches chatbot.user_id
3. If not → Return 403
4. Continue

**Example**:
```typescript
router.patch("/chatbots/:id",
  authenticate,
  authorize(ActionEnum.UPDATE, ResourceEnum.CHATBOT, ScopeEnum.SELF),
  verifyChatBotOwner,
  updateChatBot
);
```

### Visibility Levels

#### PUBLIC
- **Access**: Anyone (no authentication required)
- **Use Case**: Public knowledge bases, FAQs, support bots
- **Conversations**: Stored in `PublicConversation` with `session_id`
- **Usage Tracking**: Billed to chatbot owner

#### PRIVATE
- **Access**: Owner only
- **Use Case**: Personal assistants, private knowledge bases
- **Conversations**: Stored in `Conversation` with `user_id`

#### SHARED
- **Access**: Owner + users in `shared_with` array
- **Use Case**: Team chatbots, collaborative knowledge bases
- **Sharing**: Via `POST /chatbots/:id/share` (by email)
- **Conversations**: Each user has separate `Conversation` records

---

## Security Best Practices

### Password Security
- **Hashing**: bcrypt with 12 salt rounds (OWASP recommended)
- **Min Length**: 8 characters (enforced in validation schema)
- **No Password Storage**: Plain-text passwords never stored
- **SSO Users**: Random password hash (not used for login)

### Token Security
- **Separate Secrets**: Different secrets for access and refresh tokens
- **Short Access Token Expiry**: 1 hour (limit exposure window)
- **Longer Refresh Token Expiry**: 7 days (balance UX and security)
- **No Token Storage**: Backend doesn't store tokens (stateless)
- **Token in Header**: Bearer token in Authorization header (not query string)

### Permission Caching
- **JWT Payload**: Permissions included in access token (no DB lookup per request)
- **Refresh on Token Renewal**: Permissions updated when refreshing access token
- **Trade-off**: Permission changes require user to refresh token (or logout/login)

### CORS Protection
- **Whitelist Origins**: Only allow frontend origin (configurable via `CORS_ORIGIN`)
- **No Wildcards in Production**: Never use `CORS_ORIGIN=*` in production
- **Credentials**: `credentials: true` for cookie support (if needed)

### Rate Limiting
- **Production Only**: 100 requests / 15 minutes per IP
- **Endpoints**: All routes (global middleware)
- **Bypass**: Development mode (NODE_ENV=development)

### Input Validation
- **Zod Schemas**: All request bodies/queries validated
- **Sanitization**: MongoDB escapes special characters automatically
- **Email Validation**: Regex + format check
- **Strong Password**: Min 8 chars, uppercase, lowercase, number, special char (recommended)

### HTTP Security Headers
- **Helmet**: Enabled globally
- **XSS Protection**: `X-XSS-Protection: 1; mode=block`
- **Content Security Policy**: Prevents inline scripts
- **HSTS**: Forces HTTPS (if enabled)
- **No Sniff**: `X-Content-Type-Options: nosniff`

---

## Common Auth Patterns

### Protecting Routes
```typescript
router.get("/resource",
  authenticate,                                      // Verify JWT
  authorize(ActionEnum.READ, ResourceEnum.X, ScopeEnum.SELF),  // Check permission
  controller                                         // Handle request
);
```

### Resource Ownership Check
```typescript
// In service layer
const resource = await resourceRepo.findById(resourceId);
if (resource.user_id.toString() !== userId) {
  throw new ForbiddenError("You don't own this resource");
}
```

### Admin-Only Routes
```typescript
router.get("/admin/stats",
  authenticate,
  authorize(ActionEnum.READ, ResourceEnum.ADMIN_STATS, ScopeEnum.ALL),
  getStats
);
```

### Public Routes (No Auth)
```typescript
router.get("/public/chatbot/:id",
  getChatBot  // No authenticate middleware
);
```

### Optional Auth
```typescript
const optionalAuth = (req, res, next) => {
  try {
    authenticate(req, res, next);
  } catch {
    next();  // Continue without user
  }
};

router.get("/resource",
  optionalAuth,
  controller  // Check req.user existence in controller
);
```

---

## Testing Authentication

### Get JWT Token
```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User"
  }'

# Response includes tokens
{
  "data": {
    "tokens": {
      "accessToken": "eyJhbGc...",
      "refreshToken": "eyJhbGc..."
    }
  }
}
```

### Use Token in Requests
```bash
curl http://localhost:5000/api/v1/documents \
  -H "Authorization: Bearer eyJhbGc..."
```

### Refresh Token
```bash
curl -X POST http://localhost:5000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGc..."
  }'
```

### Decode JWT (Debug)
Use [jwt.io](https://jwt.io) to decode token payload and verify permissions.

---

## Troubleshooting

### 401 Unauthorized
- **Cause**: Missing, invalid, or expired access token
- **Solution**: Get new access token via `/auth/refresh` or login again

### 403 Forbidden
- **Cause**: Valid token but insufficient permissions
- **Solution**: Check user roles/permissions, may need admin to grant access

### Token Expired
- **Cause**: Access token older than `JWT_ACCESS_TOKEN_EXPIRES_IN`
- **Solution**: Use refresh token to get new access token

### Permission Not Found
- **Cause**: RBAC not seeded or role missing permissions
- **Solution**: Run `npm run seed:rbac` to seed permissions

### Google OAuth Fails
- **Cause**: Invalid `GOOGLE_CLIENT_ID` or token
- **Solution**: Verify client ID in Google Console, ensure token is valid

### User Inactive
- **Cause**: `user.isActive = false`
- **Solution**: Admin can reactivate via `PATCH /admin/users/:id/status`

---

## Migration from Session-Based Auth

If migrating from cookies/sessions to JWT:

1. **Add JWT Middleware**: Replace session middleware with `authenticate`
2. **Update Frontend**: Store tokens in localStorage/sessionStorage
3. **Add Refresh Flow**: Implement token refresh logic
4. **Deprecate Sessions**: Remove express-session and related code
5. **Update CORS**: Configure for token-based requests

---

## Future Enhancements

- [ ] Multi-factor authentication (MFA)
- [ ] Token revocation (blacklist)
- [ ] OAuth providers (GitHub, Microsoft)
- [ ] API keys for programmatic access
- [ ] Permission inheritance (role hierarchy)
- [ ] Attribute-based access control (ABAC)
- [ ] Audit logging (track all permission checks)

---

**Last Updated**: 11 January 2026
**Documentation Version**: 1.0.0
