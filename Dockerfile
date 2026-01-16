# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy frontend package files
COPY ephexa-frontend/package*.json ./

# Install frontend dependencies
RUN npm ci

# Copy frontend source
COPY ephexa-frontend/ ./

# Build frontend
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS backend-builder

WORKDIR /app/backend

# Copy backend package files
COPY ephexa-backend/package*.json ./
COPY ephexa-backend/prisma ./prisma/
COPY ephexa-backend/prisma.config.ts ./

# Install backend dependencies
RUN npm ci

# Generate Prisma client (using prisma.config.ts for Prisma 7)
RUN npx prisma generate --schema=prisma/schema.prisma

# Copy backend source
COPY ephexa-backend/ ./

# Build backend
RUN npm run build

# Stage 3: Production
FROM node:20-alpine AS production

WORKDIR /app

# Copy backend package files and install production dependencies
COPY ephexa-backend/package*.json ./
RUN npm ci --only=production

# Copy Prisma schema and config, then generate client
COPY ephexa-backend/prisma ./prisma/
COPY ephexa-backend/prisma.config.ts ./
RUN npx prisma generate --schema=prisma/schema.prisma

# Copy built backend
COPY --from=backend-builder /app/backend/dist ./dist

# Copy built frontend to public folder (served by Express)
COPY --from=frontend-builder /app/frontend/dist ./public

# Set environment
ENV NODE_ENV=production

# Expose port (Railway sets PORT dynamically)
EXPOSE 3001

# Start the application (Railway health check handled externally)
CMD ["node", "dist/app.js"]
