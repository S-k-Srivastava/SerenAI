# Scripts Reference

## Overview

The backend includes various npm scripts for database management, testing, and maintenance. For running the application, **always use [start.sh](../../start.sh)** (see [Deployment Guide](./deployment.md)).

**Important**: Do NOT use `npm run dev` or `npm run build` directly. Use `./start.sh` or `./start.sh --dev` instead.

---

## NPM Scripts

All scripts are defined in [node-backend/package.json](../../node-backend/package.json).

### Type Checking Scripts

#### `npm run typecheck`
**Command**: `tsc --noEmit`

**Description**: Type-checks TypeScript code without generating output files.

**Features**:
- Validates type correctness
- Checks for TypeScript errors
- No JavaScript output generated
- Fast feedback on type issues

**Use Cases**:
- Pre-commit checks
- Continuous Integration
- Validate types before build

**Example**:
```bash
npm run typecheck
```

---

### Code Quality Scripts

#### `npm run lint`
**Command**: `eslint`

**Description**: Runs ESLint on TypeScript files.

**Configuration**: [eslint.config.js](../../node-backend/eslint.config.js)

**Checks**:
- TypeScript-specific rules
- Unused imports
- Code style violations
- Best practices

**Use Cases**:
- Pre-commit hooks
- CI/CD quality gates
- Manual code review

**Example**:
```bash
npm run lint
```

**Fix Automatically**:
```bash
npm run lint -- --fix
```

#### `npm run format`
**Command**: `prettier --write "src/**/*.ts"`

**Description**: Formats all TypeScript files using Prettier.

**Configuration**: [.prettierrc](../../node-backend/.prettierrc) (if exists)

**Formatting**:
- 2 spaces indentation
- Single quotes
- Trailing commas
- Max line width: 80

**Use Cases**:
- Before committing code
- Standardizing code style across team

**Example**:
```bash
npm run format
```

---

### Database Scripts

#### `npm run seed:rbac`
**Command**: `tsx src/utils/seeders/index.ts`

**Description**: Seeds RBAC system (roles, permissions). Run this for the first time or when permissions change in rbacSeeder.

**File**: [src/utils/seeders/index.ts](../../node-backend/src/utils/seeders/index.ts)

**Process**:
1. Connects to MongoDB
2. Creates 50 permissions
3. Creates 2 default roles (Admin, User)
4. Assigns permissions to roles
5. Logs results

**Seeds**:
- **Permissions**: 50 (action:resource:scope combinations)
- **Roles**: Admin (26 permissions), User (24 permissions)

**Use Cases**:
- First time setup
- When permission structure changes in rbacSeeder
- After database reset

**Example**:
```bash
npm run seed:rbac
```

**Note**: Executed automatically by start.sh during container startup. You typically don't need to run this manually unless updating permissions.

#### `npm run seed:rbac:clear`
**Command**: `tsx src/utils/seeders/index.ts --clear`

**Description**: Removes all roles and permissions from database.

**Warning**: This will delete all RBAC data!

**Use Cases**:
- Database cleanup
- Before re-seeding
- Testing fresh RBAC setup

**Example**:
```bash
npm run seed:rbac:clear
npm run seed:rbac
```

#### `npm run seed:test-data`
**Command**: `tsx src/utils/seeders/runDataSeeder.ts`

**Description**: Seeds test data (users, chatbots, documents).

**File**: [src/utils/seeders/runDataSeeder.ts](../../node-backend/src/utils/seeders/runDataSeeder.ts)

**Use Cases**:
- Development environment setup
- Testing with realistic data
- Demo/staging environments

**Example**:
```bash
npm run seed:test-data
```

#### `npm run seed:test-data:clear`
**Command**: `tsx ../scripts/seed-data.ts --clear`

**Description**: Removes test data from database.

**Example**:
```bash
npm run seed:test-data:clear
```

#### `npm run clean:db`
**Command**: `tsx src/scripts/cleanDb.ts`

**Description**: Clears all collections in the database.

**File**: [src/scripts/cleanDb.ts](../../node-backend/src/scripts/cleanDb.ts)

**Warning**: This will delete ALL data!

**Use Cases**:
- Testing fresh database state
- Removing corrupt data
- Development cleanup

**Example**:
```bash
npm run clean:db
```

#### `npm run make-admin`
**Command**: `tsx src/scripts/create_admin_user.ts <email>`

**Description**: Assigns admin role to an existing registered user.

**File**: [src/scripts/create_admin_user.ts](../../node-backend/src/scripts/create_admin_user.ts)

**Requirements**:
- User must already be registered in the system
- Provide user's email as argument

**Process**:
1. Finds user by email
2. Finds admin role
3. Assigns admin role to user (preserves existing roles)
4. Logs updated user details

**Use Cases**:
- Promoting existing users to admin
- Restoring admin access

**Example**:
```bash
npm run make-admin user@example.com
```

**Docker Usage**:
```bash
docker compose exec backend npm run make-admin user@example.com
```

---

### Testing Scripts

#### `npm run test:api`
**Command**: `mkdir -p logs/tests && tsx src/scripts/api-test.ts 2>&1 | tee logs/tests/test-$(date +%Y-%m-%d-%H-%M-%S).log`

**Description**: Runs API integration tests and saves output to log file.

**File**: [src/scripts/api-test.ts](../../node-backend/src/scripts/api-test.ts)

**Process**:
1. Creates `logs/tests/` directory
2. Runs API tests
3. Outputs to console and timestamped log file

**Use Cases**:
- Manual API testing
- Regression testing
- CI/CD integration

**Example**:
```bash
npm run test:api
```

**Output**: `logs/tests/test-2024-01-10-12-30-45.log`

---

## Logs Management Script

### logs.sh

**File**: [logs.sh](../../logs.sh)

**Description**: Interactive utility for managing backend container logs.

#### Features

1. **View Live Logs** - Tail logs in real-time
2. **Pull Logs** - Copy logs from container to local machine

#### Usage

```bash
# Make executable (first time only)
chmod +x logs.sh

# Run script
./logs.sh
```

#### Options

##### Option 1: View Live Logs

**Command**: `sudo docker logs -f serenai_backend`

**Description**: Streams live logs from backend container.

**Features**:
- Real-time log output
- Follows new log entries
- Colored output (if supported)
- Press `Ctrl+C` to exit

**Use Cases**:
- Monitoring production issues
- Debugging in real-time
- Watching API requests

**Example**:
```bash
./logs.sh
# Select option: 1
```

**Manual Command**:
```bash
docker logs -f serenai_backend
```

##### Option 2: Pull Logs from Container

**Command**: `docker cp serenai_backend:/app/logs ./logs/pulled/logs_$(date)`

**Description**: Copies log files from container to local machine.

**Process**:
1. Creates `logs/pulled/` directory
2. Copies entire `/app/logs` directory from container
3. Names directory with current date: `logs_2024-01-10`
4. Lists pulled files

**Use Cases**:
- Offline log analysis
- Archiving logs
- Sharing logs with team
- Log rotation

**Output Location**: `./logs/pulled/logs_YYYY-MM-DD/`

**Example**:
```bash
./logs.sh
# Select option: 2
```

**Manual Command**:
```bash
docker cp serenai_backend:/app/logs ./logs/pulled/logs_$(date +%Y-%m-%d)
```

#### Configuration

**Variables** (in logs.sh):
```bash
CONTAINER_NAME="serenai_backend"  # Docker container name
LOG_DIR="./logs"                  # Local log directory
```

**Customize**:
Edit `logs.sh` to change container name or log directory.

#### Troubleshooting

**Error: "Container not running"**
```bash
# Check container status
docker compose ps

# Start container
./start.sh
```

**Error: "Path /app/logs does not exist"**
- Container may not have generated logs yet
- Try viewing live logs first (Option 1)
- Check if application started successfully

**Error: "Permission denied"**
```bash
# Make script executable
chmod +x logs.sh

# Or run with sudo
sudo ./logs.sh
```

---

## Script Combinations

### Fresh Development Setup

```bash
# 1. Use start.sh with fresh flag for clean setup
./start.sh --fresh

# 2. Register a user via API (POST /auth/register)
# 3. Promote user to admin (replace with actual user email)
docker compose exec backend npm run make-admin user@example.com
```

### Running the Application

```bash
# Development mode (with hot-reload)
./start.sh --dev

# Production mode (Docker containers)
./start.sh
```

### Database Reset

```bash
# 1. Clear all data
npm run clean:db

# 2. Reseed RBAC (if permissions changed)
npm run seed:rbac

# 3. Register a user, then promote to admin
npm run make-admin user@example.com

# 4. (Optional) Seed test data
npm run seed:test-data
```

### Code Quality Check

```bash
# 1. Format code
npm run format

# 2. Lint code
npm run lint

# 3. Type check
npm run typecheck
```

---

## Docker Integration

### Running Scripts in Container

Most npm scripts can be executed inside the Docker container:

```bash
# Seed RBAC
docker compose exec backend npm run seed:rbac

# Create admin user
docker compose exec backend npm run make-admin

# View logs
docker compose logs -f backend

# Type check
docker compose exec backend npm run typecheck
```

### Logs Access

```bash
# View live logs
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail=100 backend

# Logs since timestamp
docker compose logs --since 2024-01-10T12:00:00 backend

# Pull logs to local
./logs.sh  # Option 2
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
- name: Lint code
  run: docker compose exec backend npm run lint

- name: Type check
  run: docker compose exec backend npm run typecheck

- name: Run tests
  run: docker compose exec backend npm run test:api
```

---

## Best Practices

### Development

1. **Always use `./start.sh --dev`** for development
2. **Run `npm run typecheck`** before committing code
3. **Format code** with `npm run format` before pull requests
4. **Seed RBAC** is handled automatically by start.sh

### Production

1. **Always use `./start.sh`** for production deployment
2. **Monitor logs** regularly with `./logs.sh`
3. **Backup database** before running `npm run clean:db`

### Database Management

1. **Never run `clean:db`** in production
2. **Always backup** before database operations
3. **Test seeders** in development first
4. **Document custom migrations** in scripts/

### Logging

1. **Rotate logs regularly** to prevent disk space issues
2. **Archive pulled logs** with timestamps
3. **Monitor log size** in production
4. **Use structured logging** (Winston already configured)

---

## Troubleshooting

### Script Fails with "command not found"

**Cause**: Dependencies not installed or services not running

**Solution**:
```bash
# Use start.sh to properly initialize everything
./start.sh
```

### "Cannot find module" error

**Cause**: Services not properly started

**Solution**:
```bash
# Restart with start.sh
./start.sh --fresh
```

### Permission errors on logs.sh

**Solution**:
```bash
chmod +x logs.sh
```

### Database connection errors in scripts

**Cause**: MongoDB not running or wrong connection string

**Solution**:
```bash
# Check MongoDB
docker compose ps mongodb

# Verify .env
cat node-backend/.env | grep MONGODB_URI
```

### tsx command not found

**Cause**: Dependencies not installed in container

**Solution**:
```bash
# Rebuild containers
./start.sh --fresh
```

---

## Further Resources

- [Deployment Guide](./deployment.md) - Using start.sh for full stack deployment
- [Environment Variables](./env.md) - Configuring database connections
- [Database Schema](./database.md) - Understanding RBAC structure
- [API Reference](./api.md) - Testing endpoints after seeding

---

**Last Updated**: 11 January 2026
**Documentation Version**: 1.0.0
