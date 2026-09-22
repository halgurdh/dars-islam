# darsislam.Games — self-hosting image.
#
# Builds the static site (wrapper hub + all games) and serves it with
# nginx. The app talks to Supabase directly from the browser (see
# example.env / SELF_HOSTING.md), so this image is just a static file
# server — no backend process runs inside the container.
#
# Build (from the repo root):
#   docker build \
#     --build-arg VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co \
#     --build-arg VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY_HERE \
#     -t darsislam-games .
#
# Run:
#   docker run -p 8080:80 darsislam-games
#
# See docker-compose.yml for the easier .env-file-driven version, and
# SELF_HOSTING.md for the full walkthrough (including the one-time
# Supabase database setup this image doesn't do for you).

# ── Build stage ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# The whole repo is copied before `npm ci` (rather than just
# package*.json) because `games/*` are npm workspaces — their own
# package.json files must be present for install to resolve correctly.
COPY . .
RUN npm ci

# Baked into the static JS bundle at build time (Vite resolves
# import.meta.env when it builds, not at container-run time) — there is
# no way to change these after the image is built, which is why they're
# build args, not a runtime environment section.
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY
ARG VITE_BASE_PATH=/
ENV VITE_SUPABASE_URL=${VITE_SUPABASE_URL}
ENV VITE_SUPABASE_PUBLISHABLE_KEY=${VITE_SUPABASE_PUBLISHABLE_KEY}
ENV VITE_BASE_PATH=${VITE_BASE_PATH}

RUN npm run build

# ── Runtime stage ────────────────────────────────────────────────────────
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
