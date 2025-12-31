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

COPY apps/cart/package.json apps/cart/tsconfig.json ./apps/cart/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/common/src ./packages/common/src
COPY apps/cart/src ./apps/cart/src
COPY apps/cart/prisma ./apps/cart/prisma
COPY apps/cart/prisma.config.ts ./apps/cart/prisma.config.ts 


# Build packages first
RUN pnpm --filter @ecommerce/common build

# Generate Prisma client
WORKDIR /app/apps/cart
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public"
RUN pnpm exec prisma generate --schema=./prisma/schema.prisma

# Build cart service
WORKDIR /app
RUN pnpm --filter cart-service build

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

# Copy cart service with its node_modules
COPY --from=builder /app/apps/cart/node_modules ./apps/cart/node_modules
COPY --from=builder /app/apps/cart/dist ./apps/cart/dist
COPY --from=builder /app/apps/cart/package.json ./apps/cart/package.json
COPY --from=builder /app/apps/cart/prisma ./apps/cart/prisma
COPY --from=builder /app/apps/cart/prisma.config.ts .apps/cart/prisma.config.ts 


# Set working directory to cart app
WORKDIR /app/apps/cart

EXPOSE 4001

CMD ["node", "dist/index.js"]