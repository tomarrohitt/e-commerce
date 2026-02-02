
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate


FROM base AS builder
WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY packages/tsconfig ./packages/tsconfig

# Copy package manifests
COPY packages/common/package.json packages/common/tsconfig.json ./packages/common/
COPY packages/storage-service/package.json packages/storage-service/tsconfig.json ./packages/storage-service/
COPY apps/catalog/package.json apps/catalog/tsconfig.json ./apps/catalog/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/common/src ./packages/common/src
COPY packages/storage-service/src ./packages/storage-service/src
COPY apps/catalog/src ./apps/catalog/src
COPY apps/catalog/prisma ./apps/catalog/prisma

COPY apps/cart/prisma.config.ts /app/apps/catalog/prisma.config.ts

# Build packages first
RUN pnpm --filter @ecommerce/common build
RUN pnpm --filter @ecommerce/storage-service build

# Generate Prisma client
WORKDIR /app/apps/catalog
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public"
RUN pnpm exec prisma generate --schema=./prisma/schema.prisma

# Build catalog service
WORKDIR /app
RUN pnpm --filter catalog-service build

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

# Copy catalog service with its node_modules
COPY --from=builder /app/apps/catalog/node_modules ./apps/catalog/node_modules
COPY --from=builder /app/apps/catalog/dist ./apps/catalog/dist
COPY --from=builder /app/apps/catalog/package.json ./apps/catalog/package.json
COPY --from=builder /app/apps/catalog/prisma ./apps/catalog/prisma
COPY --from=builder /app/apps/catalog/prisma.config.ts ./apps/catalog/prisma.config.ts



# Set working directory to catalog app
WORKDIR /app/apps/catalog

EXPOSE 4002

CMD ["node", "dist/index.js"]