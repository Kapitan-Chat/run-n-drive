# KapitanChat frontend — React + Vite, built to static assets and served by nginx
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* variables at build time, so they must be present here.
ARG VITE_BASEAPI
ARG VITE_BASE_WS_URL
ARG VITE_BASE_FMS_URL
ENV VITE_BASEAPI=$VITE_BASEAPI \
    VITE_BASE_WS_URL=$VITE_BASE_WS_URL \
    VITE_BASE_FMS_URL=$VITE_BASE_FMS_URL

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
