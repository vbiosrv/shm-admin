#!/bin/sh

[ -z "$SHM_URL" ] || sed -i "s|http://shm.local|$SHM_URL|g" /etc/nginx/http.d/default.conf
[ -z "$SHM_HOST" ] || sed -i "s|http://shm.local|$SHM_HOST|g" /etc/nginx/http.d/default.conf
[ -z "$RESOLVER" ] || sed -i "s|resolver 127.0.0.11|resolver $RESOLVER|g" /etc/nginx/http.d/default.conf

if [ ! -z "$SHM_BASE_PATH" ] && [ "$SHM_BASE_PATH" != "/" ]; then
    sed -i "s|location / {|location $SHM_BASE_PATH {|" /etc/nginx/http.d/default.conf
    sed -i "s|location /shm {|location $SHM_BASE_PATH/shm {|" /etc/nginx/http.d/default.conf
    sed -i "s|#proxy_cookie_path;|proxy_cookie_path / $SHM_BASE_PATH;|" /etc/nginx/http.d/default.conf
    sed -i "s|<base href=\"/\"|<base href=\"$SHM_BASE_PATH/\"|" /app/index.html
fi

echo "Starting nginx with configuration:"
echo "  SHM_HOST: ${SHM_HOST:-http://shm.local}"
echo "  SHM_BASE_PATH: ${SHM_BASE_PATH:-/}"

exec nginx -g 'daemon off;'