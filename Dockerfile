# =========================
# Stage 1 — Build
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

# 1️⃣ Dependências
COPY package*.json ./

# 2️⃣ Prisma schema (OBRIGATÓRIO antes do generate)
COPY prisma ./prisma

RUN npm ci

# 3️⃣ Gera o Prisma Client
RUN npx prisma generate

# 4️⃣ Resto do código
COPY . .

# 5️⃣ Build do Nest
RUN npm run build


# =========================
# Stage 2 — Production
# =========================
FROM node:20-alpine

WORKDIR /app

# instala antes de rodar qualquer coisa
RUN apk add --no-cache bash netcat-openbsd

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

COPY wait-for-db.sh .


EXPOSE 3000

CMD ["sh", "-c", "./wait-for-db.sh postgres:5432 -- npx prisma migrate deploy && node dist/main.js"]

