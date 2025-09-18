# Stage 1: Builder stage (install deps, build the app)
FROM node:20-alpine AS builder

run npm i -g bun

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json first for npm caching
COPY package*.json ./

# Install deps first
RUN bun i
RUN bun add --dev typescript

# Copy the rest of the application code
COPY . .

# Build the Next.js app for production
RUN bun run build

# Stage 2: Runtime stage (slim image for production)
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Copy built artifacts from builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/next-env.d.ts ./next-env.d.ts

# Expose the port Next.js runs on (default is 3000)
EXPOSE 3000

# Run the Next.js app
CMD ["npm", "run", "start"]