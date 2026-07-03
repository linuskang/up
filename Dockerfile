# Dependencies
FROM node:26-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/upstream/package.json ./apps/upstream/package.json
RUN npm ci

FROM node:26-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

WORKDIR /app/apps/upstream
RUN npx prisma generate
RUN npm run build

FROM node:26-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV NODE_OPTIONS="--network-family-autoselection-attempt-timeout=500"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/upstream/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/upstream/.next/static ./apps/upstream/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/upstream/public ./apps/upstream/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/upstream/generated ./apps/upstream/generated
COPY --from=builder --chown=nextjs:nodejs /app/apps/upstream/prisma ./apps/upstream/prisma
COPY --from=builder --chown=nextjs:nodejs /app/apps/upstream/entrypoint.sh ./entrypoint.sh

RUN chmod +x ./entrypoint.sh

USER nextjs
EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]