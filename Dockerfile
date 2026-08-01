FROM node:24-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/docs/package.json ./apps/docs/package.json
COPY apps/upstream/package.json ./apps/upstream/package.json
COPY packages/eslint-config/package.json ./packages/eslint-config/package.json
COPY packages/typescript-config/package.json ./packages/typescript-config/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY packages/upstream-sdk/package.json ./packages/upstream-sdk/package.json
RUN npm ci

FROM node:24-alpine AS builder
WORKDIR /app
COPY --from=deps /app/ ./
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder --chown=nextjs:nodejs /app/apps/upstream/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/upstream/.next/static ./apps/upstream/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/upstream/public ./apps/upstream/public

COPY --from=builder --chown=nextjs:nodejs /app/apps/upstream/prisma ./apps/upstream/prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000

ENTRYPOINT []
CMD ["node", "apps/upstream/server.js"]
