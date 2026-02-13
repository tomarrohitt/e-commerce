FROM node:22-slim AS base

# 1. Install Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2. Build the App
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_API_URL
ARG INTERNAL_API_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_ORIGIN_URL
ARG NEXT_PUBLIC_AWS_REGION
ARG NEXT_PUBLIC_AWS_BUCKET_NAME

ENV NEXT_PUBLIC_API_URL=https://rohit-ecommerce-microservice.dedyn.io/api
ENV INTERNAL_API_URL=
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51SRYEnA4Mr7wN5Jm8hotlYOkMdTjvnJIEVvTj5KQMkpxdEF2BvmgW00ZKHIQHh6gGoexgMIL0d48gExR9ibCfk4U00z0tzHmNB
ENV NEXT_PUBLIC_ORIGIN_URL=https://rohit-ecommerce-microservice.dedyn.io
ENV NEXT_PUBLIC_AWS_REGION=ap-south-1
ENV NEXT_PUBLIC_AWS_BUCKET_NAME=ecommerce-node-microservices

RUN npm run build

# 3. Production Server
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
CMD ["node", "server.js"]
