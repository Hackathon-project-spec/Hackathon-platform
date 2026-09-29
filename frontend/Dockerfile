# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Bake the backend URLs in at build time. Defaults point at the ports
# docker-compose publishes to the host, since the browser (not this
# container) is what actually calls them.
ARG VITE_API_BASE_URL=http://localhost:9000
ARG VITE_KEYCLOAK_URL=http://localhost:8080
ARG VITE_KEYCLOAK_REALM=hackathon
ARG VITE_KEYCLOAK_CLIENT_ID=hackathon-frontend
ARG VITE_DEMO_EVENT_ID=20000000-0000-0000-0000-000000000001
ARG VITE_DEMO_MODE=false
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_KEYCLOAK_URL=$VITE_KEYCLOAK_URL \
    VITE_KEYCLOAK_REALM=$VITE_KEYCLOAK_REALM \
    VITE_KEYCLOAK_CLIENT_ID=$VITE_KEYCLOAK_CLIENT_ID \
    VITE_DEMO_EVENT_ID=$VITE_DEMO_EVENT_ID \
    VITE_DEMO_MODE=$VITE_DEMO_MODE

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Serve stage ---
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80