# --- build: compile the app ---
FROM node:22-slim AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Where the app looks for the server by default. "/api" is the same address the app is served
# from, which nginx forwards to the API, so the browser needs no CORS. Empty means local only.
ARG VITE_DEFAULT_SERVER_URL=""
ENV VITE_DEFAULT_SERVER_URL=$VITE_DEFAULT_SERVER_URL

RUN npm run build

# --- runtime: nginx serves the static app and forwards /api to the server ---
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s --retries=5 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
