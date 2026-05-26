FROM node@sha256:24dc26ef1e3c3690f27ebc4136c9c186c3133b25563ae4d7f0692e4d1fe5db0e AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@11.3.0 --activate

FROM base AS installer
WORKDIR /app

COPY out/pnpm-lock.yaml out/pnpm-workspace.yaml ./
COPY out/json/ .

RUN pnpm install --no-frozen-lockfile

FROM base AS builder
WORKDIR /app

COPY --from=installer /app ./
COPY out/full/ .

RUN pnpm --filter @ecommerce/common build

# ✅ Generate from root — client goes into root node_modules/.prisma
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public" \
    pnpm --filter cart-service exec prisma generate --schema=./prisma/schema.prisma

RUN pnpm --filter cart-service build

FROM base AS runner

ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app .

WORKDIR /app/apps/cart
EXPOSE 4003
CMD ["node", "dist/index.js"]
