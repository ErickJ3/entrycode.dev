FROM node:22-alpine AS base

FROM base AS builder

RUN apk update && apk add --no-cache libc6-compat

WORKDIR /app

RUN npm install -g pnpm turbo@^2

COPY . .
RUN turbo prune web --docker

FROM base AS installer

RUN apk update && apk add --no-cache libc6-compat

WORKDIR /app

RUN npm install -g pnpm

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml* ./

RUN pnpm install --frozen-lockfile

COPY --from=builder /app/out/full/ .

RUN pnpm turbo run build --filter=web

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000

ENV PORT=3000

CMD ["node", "apps/web/server.js"]