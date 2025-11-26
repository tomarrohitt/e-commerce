FROM node:22-slim AS base
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate



FROM base AS builder
WORKDIR /app

# Copy workspace config first
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY packages/tsconfig ./packages/tsconfig
COPY packages/common/package.json packages/common/tsconfig.json ./packages/common/
COPY apps/identity/package.json apps/identity/tsconfig.json ./apps/identity/

# Install all dependencies (this creates the symlinks)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/common/src ./packages/common/src
COPY apps/identity/src ./apps/identity/src
COPY apps/identity/prisma ./apps/identity/prisma

# Build common first (generates .d.ts files in packages/common/dist)
RUN pnpm --filter @ecommerce/common build

# Generate Prisma client
RUN pnpm --filter identity-service prisma:generate

# Build identity service
RUN pnpm --filter identity-service build

# Prune dev dependencies
RUN pnpm prune --prod




FROM base AS runner
WORKDIR /app

# Recreate the workspace structure for runtime
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Copy common (the symlink target)
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/package.json ./packages/common/

# Copy identity service
COPY --from=builder /app/apps/identity/node_modules ./apps/identity/node_modules
COPY --from=builder /app/apps/identity/dist ./apps/identity/dist
COPY --from=builder /app/apps/identity/package.json ./apps/identity/
COPY --from=builder /app/apps/identity/prisma ./apps/identity/prisma

WORKDIR /app/apps/identity

EXPOSE 4001

CMD ["node", "dist/index.js"]