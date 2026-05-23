FROM node@sha256:24dc26ef1e3c3690f27ebc4136c9c186c3133b25563ae4d7f0692e4d1fe5db0e AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# Suppress npm update notices in CI
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

FROM base AS builder
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY packages/tsconfig ./packages/tsconfig
COPY packages/common/package.json packages/common/tsconfig.json ./packages/common/
COPY apps/orders/package.json apps/orders/tsconfig.json ./apps/orders/

RUN pnpm install --frozen-lockfile

COPY packages/common/src ./packages/common/src
COPY apps/orders/src ./apps/orders/src
COPY apps/orders/prisma ./apps/orders/prisma
COPY apps/orders/prisma.config.ts ./apps/orders/prisma.config.ts

RUN pnpm --filter @ecommerce/common build

WORKDIR /app/apps/orders
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public"
RUN pnpm exec prisma generate --schema=./prisma/schema.prisma

WORKDIR /app
RUN pnpm --filter orders-service build

RUN pnpm install --frozen-lockfile --prod


FROM base AS runner

ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/package.json ./packages/common/package.json
COPY --from=builder /app/apps/orders/node_modules ./apps/orders/node_modules
COPY --from=builder /app/apps/orders/dist ./apps/orders/dist
COPY --from=builder /app/apps/orders/package.json ./apps/orders/package.json
COPY --from=builder /app/apps/orders/prisma ./apps/orders/prisma
COPY --from=builder /app/apps/orders/prisma.config.ts ./apps/orders/prisma.config.ts

WORKDIR /app/apps/orders
EXPOSE 4004
CMD ["node", "dist/index.js"]