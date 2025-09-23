FROM node:22.19.0-trixie-slim AS hgp_ai_server

WORKDIR /app

RUN apt update && apt upgrade -y
RUN apt-get install -y npm && rm -rf /var/lib/apt/lists/*

COPY ./server_files/* /app/
RUN npm ci

ENTRYPOINT ["node","serverIA.js"]
