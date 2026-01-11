# Environment Variables

## Overview

The frontend uses environment variables for configuration. All frontend environment variables must be prefixed with `NEXT_PUBLIC_` to be accessible in the browser.

**Configuration File**: [frontend/.env.example](../../frontend/.env.example)

---

## `.env` File Variables

These are the standard environment variables you should configure in your `frontend/.env` file.

### OAuth / SSO Configuration

#### `NEXT_PUBLIC_GOOGLE_CLIENT_ID` **(optional)**

- **Type**: `string`
- **Get from**: https://console.cloud.google.com/
- **Description**: Google OAuth 2.0 Client ID for Google Sign-In integration. **If not provided, Google Sign-In button will not work on login/register pages**.
- **Must Match**: Backend's `GOOGLE_CLIENT_ID` variable

**Example**:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

---

## Docker Compose Environment Variables

**Note: These are NOT used frequently for local development.** They are defined in [docker-compose.yml](../../docker-compose.yml) and are set when running the full stack in Docker containers.

### Frontend Service Configuration

When running `./start.sh` (Docker mode), these environment variables are injected into the frontend container:

#### Build Arguments (`args`)

##### `NEXT_PUBLIC_API_URL`
- **Value**: `http://localhost:5000/api/v1`
- **Description**: API URL for Docker build. Set at build time for Next.js to embed in client bundle.

#### Environment Variables (`environment`)

##### `NODE_ENV`
- **Value**: `production`
- **Description**: Forces production mode in Docker container.

##### `NEXT_TELEMETRY_DISABLED`
- **Value**: `1`
- **Description**: Disables Next.js telemetry collection.

#### Environment File (`env_file`)

The frontend container also loads variables from:
```yaml
env_file:
  - ./frontend/.env
```

This means your `frontend/.env` file is automatically loaded into the Docker container.

---

## Example `.env` File

Create this file at `frontend/.env`:

```env
# ============================================
# OAuth / SSO Configuration (Optional)
# ============================================
# Get from: https://console.cloud.google.com/
# If not provided, Google Sign-In button will not work
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

**Note**: `NEXT_PUBLIC_API_URL` is configured in Docker build args, not in `.env`.

---

## Important Notes

### 1. NEXT_PUBLIC_ Prefix Required

Variables must start with `NEXT_PUBLIC_` to be accessible in the browser.

```env
# ❌ Wrong - won't work
API_URL=http://localhost:3000

# ✅ Correct
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Backend CORS Configuration

Backend must allow frontend origin. Ensure backend CORS is configured:

```javascript
// Backend (Express.js)
app.use(cors({
  origin: ['http://localhost:4000', 'https://yourdomain.com'],
  credentials: true,
}));
```

---

## Troubleshooting

### Changes Not Reflected

After changing `.env`, restart using `./start.sh --dev`.

### Google Sign-In Not Working

**Problem**: Google button not showing or OAuth fails

**Check**:
1. Ensure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `frontend/.env`
2. Verify Client ID matches backend's `GOOGLE_CLIENT_ID`
3. Check Google Console authorized origins include your frontend URL

---

## Further Resources

- [Deployment Guide](./deployment.md) - Using start.sh
- [API Integration](./api-integration.md) - How API URL is used

---

**Last Updated**: 11 January 2026
**Documentation Version**: 1.0.0
