FROM node@sha256:24dc26ef1e3c3690f27ebc4136c9c186c3133b25563ae4d7f0692e4d1fe5db0e AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@11.3.0 --activate

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
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public" \
    pnpm prisma generate --schema=./prisma/schema.prisma

WORKDIR /app
RUN pnpm --filter cart-service build

RUN pnpm --filter cart-service deploy --prod --legacy /app/prod

FROM node@sha256:2bdb65ed1dab192432bc31c95f94155ca5ad7fc1392fb7eb7526ab682fa5bf14 AS runner

ENV NODE_ENV=production
WORKDIR /app

RUN apk add --no-cache openssl libc6-compat

COPY --from=builder /app/prod .

EXPOSE 4003
CMD ["node", "dist/index.js"]