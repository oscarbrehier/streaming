# --- dependencies stage ---
FROM node:22.14.0-alpine AS deps
WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./

RUN npm ci && \
    cp -R node_modules /tmp/prod_modules && \
    npm ci

# --- build stage ---
FROM node:22.14.0-alpine AS builder
WORKDIR /app

ARG TMDB_READ_TOKEN
ARG TMDB_API_KEY
ARG SUPABASE_URL
ARG SUPABASE_ANON_KEY
ARG SUPABASE_SERVICE_ROLE_SECRET

ENV TMDB_READ_TOKEN=${TMDB_READ_TOKEN}
ENV TMDB_API_KEY=${TMDB_API_KEY}
ENV NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
ENV SUPABASE_SERVICE_ROLE_SECRET=${SUPABASE_SERVICE_ROLE_SECRET}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# --- runtime stage ---
FROM node:22.14.0-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3005

ENV TMDB_READ_TOKEN=""
ENV TMDB_API_KEY=""
ENV NEXT_PUBLIC_SUPABASE_URL=""
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=""
ENV SUPABASE_SERVICE_ROLE_SECRET=""

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=deps /tmp/prod_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3005

CMD ["npm", "start"]