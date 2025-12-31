FROM node:22-slim AS base

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

FROM base AS builder
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY packages/tsconfig ./packages/tsconfig


COPY packages/common/package.json packages/common/tsconfig.json ./packages/common/
COPY apps/api-gateway/package.json apps/api-gateway/tsconfig.json ./apps/api-gateway/

RUN pnpm install --frozen-lockfile

COPY packages/common/src ./packages/common/src
COPY apps/api-gateway/src ./apps/api-gateway/src

RUN pnpm --filter @ecommerce/common build


RUN pnpm --filter api-gateway build

RUN pnpm prune --prod

FROM base AS runner
WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/package.json ./packages/common/

COPY --from=builder /app/apps/api-gateway/node_modules ./apps/api-gateway/node_modules
COPY --from=builder /app/apps/api-gateway/dist ./apps/api-gateway/dist
COPY --from=builder /app/apps/api-gateway/package.json ./apps/api-gateway/

WORKDIR /app/apps/api-gateway

EXPOSE 4000

CMD ["node", "dist/index.js"]