
FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.0.0 --activate

FROM base AS builder
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY packages/tsconfig ./packages/tsconfig

COPY packages/common/package.json packages/common/tsconfig.json ./packages/common/

COPY apps/cart/package.json apps/cart/tsconfig.json ./apps/cart/

RUN pnpm install --frozen-lockfile

COPY packages/common/src ./packages/common/src
COPY apps/cart/src ./apps/cart/src
COPY apps/cart/prisma ./apps/cart/prisma
COPY apps/cart/prisma.config.ts ./apps/cart/prisma.config.ts 


RUN pnpm --filter @ecommerce/common build

WORKDIR /app/apps/cart
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public"

RUN pnpm prisma generate --schema=./prisma/schema.prisma

WORKDIR /app
RUN pnpm --filter cart-service build


FROM base AS runner

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/package.json ./packages/common/package.json

COPY --from=builder /app/apps/cart/node_modules ./apps/cart/node_modules
COPY --from=builder /app/apps/cart/dist ./apps/cart/dist
COPY --from=builder /app/apps/cart/package.json ./apps/cart/package.json
COPY --from=builder /app/apps/cart/prisma ./apps/cart/prisma
COPY --from=builder /app/apps/cart/prisma.config.ts .apps/cart/prisma.config.ts 

WORKDIR /app/apps/cart

EXPOSE 4001

CMD ["node", "dist/index.js"]