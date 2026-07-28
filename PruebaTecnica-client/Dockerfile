# ---------- build ----------
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite fija las variables VITE_* en tiempo de compilacion.
# Por defecto el API se consume por el mismo origen (nginx hace de proxy inverso).
ARG VITE_BACKEND_URL=/api/v1
ARG VITE_APP_NAME="DGII Tax Management"
ARG VITE_API_TIMEOUT=10000
ARG VITE_ENABLE_LOGGING=false

ENV VITE_BACKEND_URL=$VITE_BACKEND_URL \
    VITE_APP_NAME=$VITE_APP_NAME \
    VITE_API_TIMEOUT=$VITE_API_TIMEOUT \
    VITE_ENABLE_LOGGING=$VITE_ENABLE_LOGGING

RUN npm run build

# ---------- runtime ----------
FROM nginx:1.27-alpine AS final

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Se usa 127.0.0.1 y no "localhost": nginx escucha solo en IPv4 y "localhost"
# resuelve primero a ::1 dentro del contenedor.
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=5 \
    CMD wget --spider -q http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
