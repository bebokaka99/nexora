# syntax=docker/dockerfile:1
# NEXORA Frontend — Next.js 15 (App Router)
#
# Build context là thư mục frontend/ (xem docker-compose.yml):
#   docker build -f Dockerfile .   (chạy trong frontend/)
#
# LƯU Ý: frontend/next.config.mjs hiện KHÔNG có `output: 'standalone'`,
# nên image này dùng cách build truyền thống: copy toàn bộ node_modules +
# .next rồi chạy `next start`. Nếu sau này bật `output: 'standalone'` thì
# mới đổi sang copy `.next/standalone` + `.next/static`.
#
# NEXT_PUBLIC_API_URL được nhúng vào bundle lúc `next build`, nên phải truyền
# qua build-arg (docker-compose đã làm) và build lại khi đổi URL API.

# ---- Stage 1: cài dependencies ---------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- Stage 2: build ----------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . ./
ARG NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
RUN npm run build

# ---- Stage 3: runtime --------------------------------------------------------
FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
EXPOSE 3000
CMD ["npm", "start"]
