FROM node:22-alpine AS base

FROM base AS builder
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm turbo@^2

COPY . .
RUN turbo prune api --docker

FROM base AS installer
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g pnpm

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .
COPY --from=builder /app/repositories.toml ./repositories.toml

RUN pnpm turbo run build --filter=api

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=installer --chown=nestjs:nodejs /app ./

USER nestjs

EXPOSE 3000
ENV PORT=3000

CMD ["sh", "-c", "cd apps/api && npx drizzle-kit migrate && cd ../.. && node apps/api/dist/main"]