
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

COPY packages/storage-service/package.json packages/storage-service/tsconfig.json ./packages/storage-service/

COPY apps/invoice/package.json apps/invoice/tsconfig.json ./apps/invoice/

RUN pnpm install --frozen-lockfile

COPY packages/common/src ./packages/common/src
COPY packages/storage-service/src ./packages/storage-service/src
COPY apps/invoice/src ./apps/invoice/src
COPY apps/invoice/prisma ./apps/invoice/prisma
COPY apps/invoice/prisma.config.ts ./apps/invoice/prisma.config.ts 


RUN pnpm --filter @ecommerce/common build
RUN pnpm --filter @ecommerce/storage-service build


WORKDIR /app/apps/invoice
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy?schema=public"
RUN pnpm exec prisma generate --schema=./prisma/schema.prisma


WORKDIR /app
RUN pnpm --filter invoice-service build


FROM base AS runner

ENV NODE_ENV=production

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml

COPY --from=builder /app/packages/common/dist ./packages/common/dist
COPY --from=builder /app/packages/common/package.json ./packages/common/package.json

COPY --from=builder /app/packages/storage-service/dist ./packages/storage-service/dist
COPY --from=builder /app/packages/storage-service/package.json ./packages/storage-service/package.json
COPY --from=builder /app/packages/storage-service/node_modules ./packages/storage-service/node_modules


COPY --from=builder /app/apps/invoice/node_modules ./apps/invoice/node_modules
COPY --from=builder /app/apps/invoice/dist ./apps/invoice/dist
COPY --from=builder /app/apps/invoice/package.json ./apps/invoice/package.json
COPY --from=builder /app/apps/invoice/prisma ./apps/invoice/prisma
COPY --from=builder /app/apps/invoice/prisma.config.ts ./apps/invoice/prisma.config.ts 

WORKDIR /app/apps/invoice

EXPOSE 4005

CMD ["node", "dist/index.js"]