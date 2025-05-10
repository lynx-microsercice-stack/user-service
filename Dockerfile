# Build stage
FROM node:20-alpine AS builder

# Add necessary packages and clean cache in same layer
RUN apk add --no-cache python3 make g++ openssl \
    && yarn config set cache-folder /tmp/yarn-cache

WORKDIR /app

# Copy package files for better layer caching
COPY package.json yarn.lock ./

# Install ALL dependencies (including devDependencies) for build
RUN yarn install --frozen-lockfile

# Copy source code
COPY . .

# Build application and verify dist directory exists
RUN yarn build \
    && ls -la dist/ \
    && echo "Build completed successfully"

# Production stage
FROM node:20-alpine AS production

# Add runtime dependencies and security patches
RUN apk add --no-cache curl bash openssl netcat-openbsd dos2unix \
    && apk upgrade --no-cache \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy package files first
COPY package.json yarn.lock ./

# Install ONLY production dependencies
RUN yarn install --frozen-lockfile --production=true \
    && yarn cache clean --all

# Copy the build output and migrations
COPY --from=builder /app/dist ./dist
RUN ls -la dist/ && echo "Dist files copied successfully"

# Copy and prepare start script with correct line endings
COPY start.sh .
RUN dos2unix start.sh && chmod +x start.sh

# Set proper permissions
RUN chown -R appuser:appgroup /app

# Use non-root user
USER appuser

# Health check configuration
HEALTHCHECK --interval=30s --timeout=3s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:${PORT:-3000}/health || exit 1

# Environment variables
ENV NODE_ENV=production \
    PORT=3000

# Expose port
EXPOSE ${PORT}

# Start command
CMD ["./start.sh"]
