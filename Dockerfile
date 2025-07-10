FROM node:22-alpine AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apk add --no-cache libc6-compat && \
    corepack enable && \
    pnpm install -g turbo

FROM base AS pruner

WORKDIR /app

COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./ 
COPY package.json ./
COPY turbo.json ./ 

COPY . .

RUN turbo prune --scope=api --docker

FROM base AS builder

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY --from=pruner /app/out/json/ ./
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

RUN --mount=type=cache,id=pnpm,target=/root/.pnpm-store pnpm install --frozen-lockfile

COPY --from=pruner /app/out/full/ ./
COPY turbo.json ./
COPY repositories.toml ./

RUN turbo run build --filter=api

FROM node:22-alpine AS production

WORKDIR /app

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/repositories.toml ./repositories.toml

RUN chown -R nestjs:nodejs /app
USER nestjs

EXPOSE 3000

ENTRYPOINT ["sh", "-c", "pnpm drizzle-kit push && node dist/main"]