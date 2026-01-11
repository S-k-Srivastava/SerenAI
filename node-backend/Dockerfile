FROM node:20-alpine

WORKDIR /app

# Install dependencies needed for build (e.g. python for bcrypt) if necessary
RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

# Build TypeScript
RUN npm run build

EXPOSE 5000

ENV PORT=5000


CMD ["sh", "-c", "npm run seed:rbac && npm run start:prod"]
