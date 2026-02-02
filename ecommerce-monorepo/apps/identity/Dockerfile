# -----------------------------------------------------------------------------
# STAGE 1: BASE
# -----------------------------------------------------------------------------
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

# -----------------------------------------------------------------------------
# STAGE 2: BUILDER
# -----------------------------------------------------------------------------
FROM base AS builder
WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY packages/tsconfig ./packages/tsconfig

# Copy package manifests
COPY packages/common/package.json packages/common/tsconfig.json ./packages/common/
COPY packages/storage-service/package.json packages/storage-service/tsconfig.json ./packages/storage-service/
COPY apps/identity/package.json apps/identity/tsconfig.json ./apps/identity/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/common/src ./packages/common/src
COPY packages/storage-service/src ./packages/storage-service/src
COPY apps/identity/src ./apps/identity/src
COPY apps/identity/prisma ./apps/identity/prisma
COPY apps/identity/prisma.config.ts ./apps/identity/prisma.config.ts 

# Build packages first
RUN pnpm --filter @ecommerce/common build
RUN pnpm --filter @ecommerce/storage-service build

# Generate Prisma client
WORKDIR /app/apps/identity
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public"
RUN pnpm exec prisma generate --schema=./prisma/schema.prisma

# Build identity service
WORKDIR /app
RUN pnpm --filter identity-service build

# -----------------------------------------------------------------------------
# STAGE 3: RUNNER
# -----------------------------------------------------------------------------
FROM base AS runner

ENV NODE_ENV=production

WORKDIR /app

# Copy root node_modules (contains hoisted dependencies like dotenv)
COPY --from=builder /app/node_modules ./node_modules

# Copy workspace config files
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

# Copy built packages with their node_modules (which contain symlinks)
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/package.json ./packages/common/package.json

COPY --from=builder /app/packages/storage-service/dist ./packages/storage-service/dist
COPY --from=builder /app/packages/storage-service/package.json ./packages/storage-service/package.json
COPY --from=builder /app/packages/storage-service/node_modules ./packages/storage-service/node_modules

# Copy identity service with its node_modules
COPY --from=builder /app/apps/identity/node_modules ./apps/identity/node_modules
COPY --from=builder /app/apps/identity/dist ./apps/identity/dist
COPY --from=builder /app/apps/identity/package.json ./apps/identity/package.json
COPY --from=builder /app/apps/identity/prisma ./apps/identity/prisma
COPY --from=builder /app/apps/identity/prisma.config.ts ./apps/identity/prisma.config.ts 



# Set working directory to identity app
WORKDIR /app/apps/identity

EXPOSE 4001

CMD ["node", "dist/index.js"]