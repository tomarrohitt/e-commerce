FROM node@sha256:24dc26ef1e3c3690f27ebc4136c9c186c3133b25563ae4d7f0692e4d1fe5db0e AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@11.3.0 --activate

FROM base AS builder
WORKDIR /app

COPY . .
RUN pnpm install --no-frozen-lockfile
RUN pnpm --filter @ecommerce/common build
RUN pnpm --filter @ecommerce/storage-service build
RUN DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public" \
    pnpm --filter catalog-service exec prisma generate --schema=./prisma/schema.prisma
RUN pnpm --filter catalog-service build
RUN pnpm --filter catalog-service deploy --prod /prod/catalog

FROM node@sha256:242549cd46785b480c832479a730f4f2a20865d61ea2e404fdb2a5c3d3b73ecf AS runner

ENV NODE_ENV=production
WORKDIR /prod/catalog

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY --from=builder /prod/catalog .

RUN mkdir -p /prod/catalog/node_modules/.bin && \
    ln -sf /prod/catalog/node_modules/.pnpm/prisma@6.5.0_typescript@5.9.3/node_modules/prisma/build/index.js \
    /prod/catalog/node_modules/.bin/prisma

EXPOSE 4002
CMD ["node", "dist/index.js"]

