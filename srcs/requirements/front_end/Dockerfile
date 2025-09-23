FROM node:22.19.0-trixie-slim AS HGP_front_server

WORKDIR /app

RUN apt update && apt upgrade -y
RUN apt-get install -y npm && rm -rf /var/lib/apt/lists/*

COPY ./server_files/* /app/
RUN npm i

WORKDIR /app/front_end/ft_transcendence_front

ENTRYPOINT ["npm", "run", "dev"]
