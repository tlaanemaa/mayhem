# syntax=docker/dockerfile:1
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package manifests first — Docker layer cache skips npm install if these don't change
COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/engine/package.json packages/engine/
COPY packages/games/mayhem/package.json packages/games/mayhem/
COPY packages/client/package.json packages/client/
COPY packages/server/package.json packages/server/

RUN npm install

COPY . .

# Build: TypeScript project references (all server-side packages) + Vite (client)
RUN npm run build

# --- Production runner ---
FROM node:22-alpine AS runner

WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/shared/package.json packages/shared/
COPY packages/engine/package.json packages/engine/
COPY packages/games/mayhem/package.json packages/games/mayhem/
COPY packages/client/package.json packages/client/
COPY packages/server/package.json packages/server/

RUN npm install --omit=dev

COPY --from=builder /app/packages/shared/dist packages/shared/dist
COPY --from=builder /app/packages/engine/dist packages/engine/dist
COPY --from=builder /app/packages/games/mayhem/dist packages/games/mayhem/dist
COPY --from=builder /app/packages/server/dist packages/server/dist
COPY --from=builder /app/packages/client/dist packages/client/dist

RUN addgroup -S mayhem && adduser -S mayhem -G mayhem
USER mayhem

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "packages/server/dist/index.js"]
