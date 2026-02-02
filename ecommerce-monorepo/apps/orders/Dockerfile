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

COPY apps/orders/package.json apps/orders/tsconfig.json ./apps/orders/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/common/src ./packages/common/src
COPY apps/orders/src ./apps/orders/src
COPY apps/orders/prisma ./apps/orders/prisma
COPY apps/orders/prisma.config.ts ./apps/orders/prisma.config.ts 


# Build packages first
RUN pnpm --filter @ecommerce/common build

# Generate Prisma client
WORKDIR /app/apps/orders
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public"
RUN pnpm exec prisma generate --schema=./prisma/schema.prisma

# Build orders service
WORKDIR /app
RUN pnpm --filter orders-service build

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

# Copy orders service with its node_modules
COPY --from=builder /app/apps/orders/node_modules ./apps/orders/node_modules
COPY --from=builder /app/apps/orders/dist ./apps/orders/dist
COPY --from=builder /app/apps/orders/package.json ./apps/orders/package.json
COPY --from=builder /app/apps/orders/prisma ./apps/orders/prisma
COPY --from=builder /app/apps/orders/prisma.config.ts ./apps/orders/prisma.config.ts

# Set working directory to orders app
WORKDIR /app/apps/orders

EXPOSE 4004

CMD ["node", "dist/index.js"]