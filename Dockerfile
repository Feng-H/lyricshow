# Build the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage - simple HTTP server
FROM node:18-alpine AS production

# Install serve package and curl for health check
RUN npm install -g serve && \
    apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/out ./

# Switch to non-root user
USER nextjs

# Expose port 9090
EXPOSE 9090

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:9090/ || exit 1

# Start the server
CMD ["serve", "-s", ".", "-l", "9090", "--no-clipboard"]