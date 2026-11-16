# syntax=docker/dockerfile:1
# NEXORA Backend — NestJS (Modular Monolith) + Prisma
#
# Build context PHẢI LÀ THƯ MỤC GỐC của repo (xem docker-compose.yml):
#   docker build -f backend/Dockerfile .
# Lý do: Prisma schema + migrations nằm ở database/prisma/ (ngoài backend/),
# và backend/package.json khai báo "prisma.schema": "../database/prisma/schema.prisma".
# `npm ci` kích hoạt postinstall `prisma generate`, nên schema phải có mặt
# TRƯỚC khi cài dependencies (stage deps đã copy schema.prisma trước).
#
# Chạy:
#   docker compose up backend
#   # API: http://localhost:4000/api/v1 — Swagger: http://localhost:4000/docs
# Khi khởi động, container tự chạy `prisma migrate deploy` rồi mới `node dist/main`
# (xem CMD bên dưới) nên database luôn ở đúng migration mới nhất.

# ---- Stage 1: cài dependencies ---------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
# Schema Prisma cần có trước `npm ci` (postinstall prisma generate).
COPY database/prisma/schema.prisma /database/prisma/schema.prisma
COPY backend/package.json backend/package-lock.json ./
RUN npm ci

# ---- Stage 2: build ----------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY backend/ ./
COPY database/prisma /database/prisma
RUN npx prisma generate --schema=/database/prisma/schema.prisma
RUN npm run build

# ---- Stage 3: runtime --------------------------------------------------------
FROM node:22-alpine AS runner
ENV NODE_ENV=production
WORKDIR /app
# Giữ nguyên node_modules đã build (gồm prisma CLI để chạy migrate deploy).
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json
COPY database/prisma /database/prisma
EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy --schema=/database/prisma/schema.prisma && node dist/main"]
