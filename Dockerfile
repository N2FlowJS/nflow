FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
ENV NODE_ENV=production
RUN npm run build