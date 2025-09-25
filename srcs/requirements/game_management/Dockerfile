FROM node:22.19.0-trixie-slim

WORKDIR /app

RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y npm && rm -rf /var/lib/apt/lists/*

COPY ./server_files/ /app/
RUN npm ci

ENTRYPOINT ["node","server.js"]
