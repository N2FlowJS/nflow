FROM node:20-slim AS builder

WORKDIR /app

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy root package files
COPY package*.json ./
COPY back-end/package*.json ./back-end/
COPY packages/types/package*.json ./packages/types/

# Install dependencies (only for backend and types)
RUN npm install

# Copy source code
COPY back-end ./back-end
COPY packages/types ./packages/types

# Generate Prisma client
WORKDIR /app/back-end
RUN npx prisma generate

# Build the project
RUN npm run build

# Production image
FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/back-end/dist ./dist
COPY --from=builder /app/back-end/package*.json ./
COPY --from=builder /app/back-end/node_modules ./node_modules
COPY --from=builder /app/packages/types /app/packages/types

# Expose port
EXPOSE 8787

CMD ["node", "dist/index.js"]
