# Use this for any service (replace SERVICE_PATH)
FROM node:22-slim
WORKDIR /app

# pnpm available
RUN npm install -g pnpm@9

# Copy lockfiles & workspace config first (cache-friendly)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./

# Copy everything that build needs (packages + apps)
COPY packages ./packages
COPY apps ./apps
# If you have other top-level files needed for build, copy them too
COPY tsconfig.* ./

# Install only what's required (workspace-aware)
RUN pnpm install --frozen-lockfile

# Build only the target service by path (avoid relying on package name)
# Replace ./apps/api-gateway with the path to the service folder in the repo
RUN pnpm --filter ./apps/api-gateway build

# Run the service (again, use path selector)
CMD ["pnpm", "--filter", "./apps/api-gateway", "start"]
