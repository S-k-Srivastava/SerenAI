#!/bin/bash

# Definition of required backend variables (based on .env.example)
REQUIRED_BACKEND_VARS=(
  "JWT_ACCESS_TOKEN_SECRET"
  "JWT_REFRESH_TOKEN_SECRET"
  "JWT_ACCESS_TOKEN_EXPIRES_IN"
  "JWT_REFRESH_TOKEN_EXPIRES_IN"
  "BCRYPT_SALT_ROUNDS"
  "API_VERSION"
  "USE_LOCAL_EMBEDDING"
)

# Definition of required frontend variables
REQUIRED_FRONTEND_VARS=()

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Parse arguments
FRESH_START=false
DEV_MODE=false

for arg in "$@"
do
    case $arg in
        --fresh)
        FRESH_START=true
        shift # Remove --fresh from processing
        ;;
        --dev)
        DEV_MODE=true
        shift # Remove --dev from processing
        ;;
        *)
        shift # Remove generic argument from processing
        ;;
    esac
done

if [ "$FRESH_START" = true ]; then
    echo -e "${YELLOW}WARNING: You have requested a FRESH START.${NC}"
    echo -e "${YELLOW}This will stop all containers, remove networks, volumes, and local images related to this project.${NC}"
    echo -e "${YELLOW}ALL DB DATA WILL BE LOST.${NC}"
    read -p "Are you sure you want to proceed? (yes/no): " confirm
    
    if [[ "$confirm" == "yes" ]]; then
        echo -e "${GREEN}Cleaning up Docker resources...${NC}"
        # We use explicit cleanup
        docker compose down -v --rmi local --remove-orphans
        # Force remove known containers to prevent name conflicts
        docker rm -f serenai_mongodb serenai_mongo_init serenai_qdrant serenai_embeddings serenai_backend serenai_frontend 2>/dev/null || true
        echo -e "${GREEN}Cleanup complete.${NC}"
    else
        echo -e "${RED}Fresh start cancelled.${NC}"
        exit 0
    fi
fi

echo -e "${YELLOW}Starting Environment Validation...${NC}"

ERROR_FOUND=false

check_env_file() {
  local service_name=$1
  local env_file=$2
  local -n required_vars=$3
  
  echo -e "Checking ${service_name} environment..."

  if [ ! -f "$env_file" ]; then
    echo -e "${RED}[ERROR] Missing .env file for ${service_name} at: ${env_file}${NC}"
    echo "Please create it from .env.example"
    ERROR_FOUND=true
    return
  fi
  
  for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=" "$env_file" && ! grep -q "^${var} =" "$env_file"; then
       echo -e "${RED}[ERROR] Missing required variable in ${service_name} .env: ${var}${NC}"
       ERROR_FOUND=true
    fi
  done
}

check_env_file "Backend" "./node-backend/.env" REQUIRED_BACKEND_VARS
check_env_file "Frontend" "./frontend/.env" REQUIRED_FRONTEND_VARS

echo ""
echo "--------------------------------------------------------"

# Specific check for MongoDB Local usage
BACKEND_ENV="./node-backend/.env"
if [ -f "$BACKEND_ENV" ]; then
    MONGO_URI=$(grep "^MONGODB_URI=" "$BACKEND_ENV" | cut -d '=' -f2)

    if [[ "$MONGO_URI" == *"localhost"* ]] || [[ "$MONGO_URI" == *"127.0.0.1"* ]]; then
        if [ "$DEV_MODE" = false ]; then
            echo -e "${YELLOW}[WARNING] MongoDB URI uses 'localhost'. For Docker, this must start with 'mongodb://mongodb:27017/'${NC}"
            echo -e "Current: $MONGO_URI"
            echo -e "Recommended change: MONGODB_URI=mongodb://mongodb:27017/serenai"
        else
             echo -e "${GREEN}MongoDB URI is set to localhost, which is correct for --dev mode.${NC}"
        fi
    elif [ "$DEV_MODE" = true ]; then
         echo -e "${YELLOW}[WARNING] MongoDB URI suggests a docker container (e.g. mongodb://mongodb...). For --dev mode, you normally want localhost.${NC}"
    fi
fi

echo "--------------------------------------------------------"

# Conditional check for embedding configuration
if [ -f "$BACKEND_ENV" ]; then
    USE_LOCAL_EMBEDDING=$(grep "^USE_LOCAL_EMBEDDING=" "$BACKEND_ENV" | cut -d '=' -f2 | tr -d '\r' | tr -d '"')

    echo -e "Checking embedding configuration..."

    if [[ "$USE_LOCAL_EMBEDDING" == "true" ]]; then
        echo -e "${GREEN}Using local embedding service${NC}"

        # Check if EMBEDDING_LOCAL_MODEL is set
        if ! grep -q "^EMBEDDING_LOCAL_MODEL=" "$BACKEND_ENV" || [ -z "$(grep "^EMBEDDING_LOCAL_MODEL=" "$BACKEND_ENV" | cut -d '=' -f2)" ]; then
            echo -e "${RED}[ERROR] EMBEDDING_LOCAL_MODEL must be set when USE_LOCAL_EMBEDDING=true${NC}"
            ERROR_FOUND=true
        else
            EMBEDDING_MODEL=$(grep "^EMBEDDING_LOCAL_MODEL=" "$BACKEND_ENV" | cut -d '=' -f2 | tr -d '\r' | tr -d '"')
            echo -e "${GREEN}Embedding model: ${EMBEDDING_MODEL}${NC}"
        fi
    else
        echo -e "${GREEN}Using OpenAI embedding service${NC}"

        # Check if OPENAI_API_KEY is set
        if ! grep -q "^OPENAI_API_KEY=" "$BACKEND_ENV" || [ -z "$(grep "^OPENAI_API_KEY=" "$BACKEND_ENV" | cut -d '=' -f2)" ]; then
            echo -e "${RED}[ERROR] OPENAI_API_KEY must be set when USE_LOCAL_EMBEDDING=false${NC}"
            ERROR_FOUND=true
        fi
    fi
fi

echo "--------------------------------------------------------"

if [ "$ERROR_FOUND" = true ]; then
  echo -e "${RED}Validation Failed. Please fix the errors above.${NC}"
  exit 1
else
  echo -e "${GREEN}Validation Passed! Starting Services...${NC}"

  # Determine which services to start based on embedding configuration
  COMPOSE_CMD="docker compose -f docker-compose.yml"
  
  if [ -f "$BACKEND_ENV" ]; then
      USE_LOCAL_EMBEDDING=$(grep "^USE_LOCAL_EMBEDDING=" "$BACKEND_ENV" | cut -d '=' -f2 | tr -d '\r' | tr -d '"')
      if [[ "$USE_LOCAL_EMBEDDING" == "true" ]]; then
          export EMBEDDING_LOCAL_MODEL=$(grep "^EMBEDDING_LOCAL_MODEL=" "$BACKEND_ENV" | cut -d '=' -f2 | tr -d '\r' | tr -d '"')
          echo -e "${GREEN}Configured for local embedding service (model: $EMBEDDING_LOCAL_MODEL)${NC}"
          # Enable local-embeddings profile to start the embeddings container
          COMPOSE_CMD="$COMPOSE_CMD --profile local-embeddings"
      else
          echo -e "${GREEN}Configured without local embedding service (using OpenAI)${NC}"
          # Don't enable the profile, embeddings container won't start
      fi
  fi

  if [ "$DEV_MODE" = true ]; then
      echo -e "${GREEN}Running in DEV MODE (Dependencies via Docker, Apps via npm)${NC}"
      
      # Determine dependencies to start
      # mongodb, mongo-init, qdrant are always needed
      DEPENDENCIES="mongodb mongo-init qdrant"
      
      # If using local embedding, it will be picked up by the profile + the implicit 'embeddings' service dependency if strictly explicit? 
      # Actually with profile enabled, 'embeddings' service becomes available. We must explicitly list it if we want to start it without 'docker compose up' (which starts all available services).
      # But 'docker compose up service1 service2' handles it.
      
      if [[ "$USE_LOCAL_EMBEDDING" == "true" ]]; then
          DEPENDENCIES="$DEPENDENCIES embeddings"
      fi

      echo "Starting dependencies: $DEPENDENCIES"
      $COMPOSE_CMD up -d $DEPENDENCIES
      
      echo -e "${GREEN}Dependencies started. Waiting for MongoDB initialization...${NC}"
      
      # Wait for mongo-init to finish (it exits after initializing RS)
      docker wait serenai_mongo_init > /dev/null
      
      echo -e "${GREEN}MongoDB initialized.${NC}"

      # Define Common Backend Env Vars for Dev
      DEV_BACKEND_ENV="PORT=5000 NODE_ENV=development CORS_ORIGIN=http://localhost:3000 LOG_LEVEL=info MONGODB_URI=mongodb://localhost:27017/serenai?replicaSet=rs0&directConnection=true MONGODB_DATABASE_NAME=serenai QDRANT_URL=http://localhost:6333 EMBEDDING_SERVICE_URL=http://localhost:8080"
      
      echo -e "${GREEN}Running RBAC Seeder...${NC}"
      (cd node-backend && env $DEV_BACKEND_ENV npm run seed:rbac)
      
      echo -e "${GREEN}Starting local development servers...${NC}"
      
      trap 'kill 0' SIGINT
      
      (cd node-backend && env $DEV_BACKEND_ENV npm run dev) &
      BACKEND_PID=$!
      
      (cd frontend && \
       NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1 \
       npm run dev) &
      FRONTEND_PID=$!
      
      wait
  else
      echo "Running: $COMPOSE_CMD up --build"
      $COMPOSE_CMD up --build
  fi
fi
