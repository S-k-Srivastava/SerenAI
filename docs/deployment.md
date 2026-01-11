# 🚀 Deployment Guide

Complete guide for deploying SerenAI using the unified `start.sh` script.

---

## Prerequisites

- **Docker** & **Docker Compose** installed
- **.env files** configured for backend and frontend

---

## Quick Start Commands

| Command | Purpose |
|---------|---------|
| `./start.sh` | Production deployment (Docker containers) |
| `./start.sh --dev` | Development mode (hot-reload) |
| `./start.sh --fresh` | Fresh start (clears database) |
| `./start.sh --fresh --dev` | Fresh development start |

---

## Environment Setup

### 1. Install Docker

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and log back in

# Verify
docker --version
docker compose version
```

### 2. Configure Environment Files

```bash
# Backend
cp node-backend/.env.example node-backend/.env
nano node-backend/.env

# Frontend
cp frontend/.env.example frontend/.env
nano frontend/.env
```

### 3. Make Script Executable

```bash
chmod +x ./start.sh
```

---

## Deployment Modes

### Production Mode

```bash
./start.sh
```

**What it does**:
- Validates environment variables
- Builds Docker images for backend and frontend
- Starts all services: MongoDB, Qdrant, Backend, Frontend
- Runs RBAC seeder automatically
- Optionally starts local embeddings service

**Access**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api-docs

---

### Development Mode

```bash
./start.sh --dev
```

**What it does**:
- Starts dependencies in Docker (MongoDB, Qdrant, Embeddings)
- Runs backend and frontend with hot-reload
- Connects to `localhost` for databases
- Press `Ctrl+C` to stop all services

**Features**:
- Hot-reload on code changes
- Debug-friendly logging
- Faster iteration

---

### Fresh Start

```bash
./start.sh --fresh
```

**Warning**: This will delete ALL database data!

**What it does**:
- Stops all containers
- Removes Docker volumes (MongoDB, Qdrant data)
- Removes locally built images
- Starts with clean slate

---

## Services Architecture

```yaml
mongodb:      # Database (port 27017)
qdrant:       # Vector DB (port 6333)
embeddings:   # Local embeddings (optional, port 80)
backend:      # Node.js API (port 5000)
frontend:     # Next.js web app (port 3000)
```

---

## Common Commands

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend

# Use logs.sh utility
./logs.sh
```

### Restart Services

```bash
docker compose restart
docker compose restart backend
```

### Stop Services

```bash
# Stop (keeps volumes)
docker compose down

# Stop and remove volumes
docker compose down -v
```

### Execute Scripts in Container

```bash
# Make user admin
docker compose exec backend npm run make-admin user@example.com

# Seed RBAC (if permissions changed)
docker compose exec backend npm run seed:rbac
```

---

## Health Checks

```bash
# Backend health
curl http://localhost:5000/health

# Qdrant status
curl http://localhost:6333/collections
```

---

## Troubleshooting

### Port Already in Use

```bash
lsof -ti:5000
kill -9 $(lsof -ti:5000)
```

### MongoDB Connection Failed

```bash
docker compose ps mongodb
docker compose exec mongodb mongosh --eval "rs.status()"
```

### Permission Denied on start.sh

```bash
chmod +x ./start.sh
```

---

## Production Checklist

- [ ] Set strong JWT secrets
- [ ] Configure CORS_ORIGIN to frontend domain
- [ ] Set NODE_ENV=production
- [ ] Setup HTTPS/SSL via reverse proxy
- [ ] Configure firewall rules
- [ ] Setup automated backups

---

## Further Resources

- [Backend Environment Variables](./backend/env.md)
- [Frontend Environment Variables](./frontend/env.md)
- [Scripts Reference](./backend/scripts.md)
- [API Documentation](./backend/api.md)
 
 ---
 
 **Last Updated**: 11 January 2026
**Documentation Version**: 1.0.0
