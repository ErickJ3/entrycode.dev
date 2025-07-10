ARG NODE_IMAGE=node:22-alpine

FROM ${NODE_IMAGE} AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk add --no-cache libc6-compat && \
    corepack enable && \
    pnpm install -g turbo@latest pnpm@latest

FROM base AS pruner

WORKDIR /app

COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY turbo.json ./
COPY . .

RUN turbo prune --scope=api --docker

FROM base AS development

WORKDIR /app

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=pruner /app/out/full/ ./
COPY turbo.json ./
COPY repositories.toml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/.pnpm-store \
    pnpm install --frozen-lockfile

FROM base AS builder

WORKDIR /app

COPY --from=development /app ./
COPY turbo.json ./
COPY repositories.toml ./

RUN --mount=type=cache,id=pnpm,target=/pnpm/.pnpm-store \
    pnpm install --frozen-lockfile

RUN turbo run build --filter=api

FROM ${NODE_IMAGE} AS production

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=nestjs:nodejs /app/repositories.toml ./repositories.toml
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/drizzle.config.ts ./apps/api/drizzle.config.ts

USER nestjs

EXPOSE 3000

ENTRYPOINT ["node", "apps/api/dist/main"]