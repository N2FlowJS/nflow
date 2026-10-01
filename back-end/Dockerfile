FROM node:20-slim AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY back-end/package*.json ./back-end/
COPY packages/types/package*.json ./packages/types/

# Install dependencies (only for backend and types)
RUN npm install

# Copy source code
COPY back-end ./back-end
COPY packages/types ./packages/types

# Build the project
# The typed an5 client in back-end/an5Client is committed, so no code generation
# step is required at build time. Run `npm run db:generate` after editing
# back-end/an5Schema/*.an5.
WORKDIR /app/back-end
RUN npm run build

# Production image
FROM node:20-slim

WORKDIR /app

COPY --from=builder /app/back-end/dist ./dist
COPY --from=builder /app/back-end/package*.json ./
COPY --from=builder /app/back-end/node_modules ./node_modules
COPY --from=builder /app/packages/types /app/packages/types

# Expose port
EXPOSE 8787

# `tsconfig.json` sets rootDir to the repository root, so tsc emits under
# dist/back-end rather than dist.
CMD ["node", "dist/back-end/index.js"]
