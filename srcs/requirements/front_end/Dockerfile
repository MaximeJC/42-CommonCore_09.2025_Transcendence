FROM node:22.19.0-trixie-slim

WORKDIR /app

RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y npm openssl && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /app/certs
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /app/certs/hgp_https.key \
    -out /app/certs/hgp_https.crt \
    -subj "/C=FR/ST=Paris/L=Paris/O=42/OU=hgp/CN=hgp.42.fr"

COPY ./server_files/ /app/
RUN npm ci

ENTRYPOINT ["npm", "run", "dev"]
