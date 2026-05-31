FROM node:20-slim AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY front-end/package*.json ./front-end/
COPY packages/types/package*.json ./packages/types/

# Install dependencies
RUN npm install

# Copy source code
COPY front-end ./front-end
COPY packages/types ./packages/types

# Build the project
WORKDIR /app/front-end
RUN npm run build

# Production image - serve with Nginx
FROM nginx:alpine

COPY --from=builder /app/front-end/dist /usr/share/nginx/html

# Add nginx config to handle SPA routing if needed
# COPY front-end/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
