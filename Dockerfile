# Build stage
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM --platform=$BUILDPLATFORM node:20-alpine AS shm-admin-2

RUN apk add --no-cache nginx wget

EXPOSE 80

COPY nginx.conf /etc/nginx/http.d/default.conf

COPY swagger/index.html /swagger/index.html

COPY entry.sh /entry.sh
RUN chmod +x /entry.sh

COPY --from=builder /app/dist /app

WORKDIR /app

ENTRYPOINT ["/entry.sh"]

HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget --no-verbose --tries=1 --spider "127.0.0.1/shm/healthcheck.cgi" || exit 1