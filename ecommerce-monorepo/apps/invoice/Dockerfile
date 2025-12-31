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

COPY apps/invoice/package.json apps/invoice/tsconfig.json ./apps/invoice/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/common/src ./packages/common/src
COPY apps/invoice/src ./apps/invoice/src
COPY apps/invoice/prisma ./apps/invoice/prisma
COPY apps/invoice/prisma.config.ts ./apps/invoice/prisma.config.ts 


# Build packages first
RUN pnpm --filter @ecommerce/common build

# Generate Prisma client
WORKDIR /app/apps/invoice
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public"
RUN pnpm exec prisma generate --schema=./prisma/schema.prisma

# Build invoice service
WORKDIR /app
RUN pnpm --filter invoice-service build

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

# Copy invoice service with its node_modules
COPY --from=builder /app/apps/invoice/node_modules ./apps/invoice/node_modules
COPY --from=builder /app/apps/invoice/dist ./apps/invoice/dist
COPY --from=builder /app/apps/invoice/package.json ./apps/invoice/package.json
COPY --from=builder /app/apps/invoice/prisma ./apps/invoice/prisma
COPY --from=builder /app/apps/invoice/prisma.config.ts ./apps/invoice/prisma.config.ts 


# Set working directory to invoice app
WORKDIR /app/apps/invoice

EXPOSE 4001

CMD ["node", "dist/index.js"]