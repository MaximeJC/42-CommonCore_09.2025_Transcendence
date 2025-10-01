FROM caddy:2.7-alpine

RUN apk update && apk upgrade
RUN apk add --no-cache openssl

COPY ./server_files/Caddyfile /etc/caddy/Caddyfile

RUN mkdir -p /app/certs
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
	-keyout /app/certs/hgp_https.key \
	-out /app/certs/hgp_https.crt \
	-subj "/CN=hgp.local"

EXPOSE 5000

# Caddy démarre automatiquement avec la configuration
