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

# Install backend dependencies
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

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

# Copy Prisma schema and generate client
COPY ephexa-backend/prisma ./prisma/
RUN npx prisma generate

# Copy built backend
COPY --from=backend-builder /app/backend/dist ./dist

# Copy built frontend to public folder (served by Express)
COPY --from=frontend-builder /app/frontend/dist ./public

# Set environment
ENV NODE_ENV=production

# Expose port (Railway uses PORT env var)
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-3001}/health || exit 1

# Start the application
CMD ["node", "dist/app.js"]
