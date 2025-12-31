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

COPY apps/email/package.json apps/email/tsconfig.json ./apps/email/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/common/src ./packages/common/src
COPY apps/email/src ./apps/email/src

# Build packages first
RUN pnpm --filter @ecommerce/common build

# Generate Prisma client
WORKDIR /app/apps/email

# Build email service
WORKDIR /app
RUN pnpm --filter email-service build

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

# Copy email service with its node_modules
COPY --from=builder /app/apps/email/node_modules ./apps/email/node_modules
COPY --from=builder /app/apps/email/dist ./apps/email/dist
COPY --from=builder /app/apps/email/package.json ./apps/email/package.json

# Set working directory to email app
WORKDIR /app/apps/email

EXPOSE 5000

CMD ["node", "dist/index.js"]