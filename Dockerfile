# Use Node.js 18 Alpine as base image for smaller size
FROM node:18-alpine AS base

# Install system dependencies required for building and running
RUN apk add --no-cache \
    python3 \
    py3-pip \
    openjdk11 \
    gcc \
    g++ \
    make \
    git \
    curl \
    bash

# Set working directory
WORKDIR /app

# Clone the repository from GitHub
ARG GITHUB_REPO_URL=https://github.com/NIKHILSAI71/Learn.git
ARG BRANCH=master

# Clone the repository (try specified branch first, fallback to main/master)
RUN git clone ${GITHUB_REPO_URL} temp_repo && \
    cd temp_repo && \
    (git checkout ${BRANCH} 2>/dev/null || git checkout main 2>/dev/null || git checkout master) && \
    cp -r . ../ && \
    cd .. && \
    rm -rf temp_repo

# Install dependencies
RUN npm ci --only=production

# Build stage
FROM base AS builder

# Install all dependencies (including dev dependencies)
RUN npm ci

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

# Install runtime dependencies
RUN apk add --no-cache \
    python3 \
    py3-pip \
    openjdk11 \
    gcc \
    g++ \
    dumb-init

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY --from=builder /app/package*.json ./

# Install only production dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/next.config.ts ./
COPY --from=builder --chown=nextjs:nodejs /app/src ./src

# Create public directory and copy if it exists
RUN mkdir -p ./public

# Create temp directory for code execution with proper permissions
RUN mkdir -p /tmp/code-execution && \
    chown -R nextjs:nodejs /tmp/code-execution && \
    chmod 755 /tmp/code-execution

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["npm", "start"]
