FROM node:20-alpine AS base
WORKDIR /app

# ── Dependências ──────────────────────────────────────────────────
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --fund=false

# ── Build (frontend Vite + backend esbuild) ───────────────────────
FROM deps AS build
COPY . .
# Servidor principal (API + assets estáticos)
RUN npm run build
# Scripts de migration e setup compilados separadamente
RUN npx esbuild db/migrate.ts \
      --platform=node --bundle --format=esm --outfile=dist/migrate.js \
      "--banner:js=import { createRequire } from 'module';const require = createRequire(import.meta.url);"
RUN npx esbuild db/setup.ts \
      --platform=node --bundle --format=esm --outfile=dist/setup.js \
      "--banner:js=import { createRequire } from 'module';const require = createRequire(import.meta.url);"

# ── Imagem de produção (mínima) ───────────────────────────────────
FROM node:20-alpine AS production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
# Arquivos SQL necessários para o migrate em runtime
COPY --from=build /app/db/migrations ./db/migrations
COPY package.json ./

EXPOSE 3000

# Aplica migrations, cria super admin (idempotente) e inicia o servidor
CMD ["sh", "-c", "node dist/migrate.js && node dist/setup.js && npm start"]
