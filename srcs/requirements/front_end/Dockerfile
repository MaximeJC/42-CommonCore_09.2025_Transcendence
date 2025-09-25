# front_end/Dockerfile

	FROM node:22-slim AS builder
	WORKDIR /app
	COPY ./server_files/package*.json ./
	RUN npm install
	COPY ./server_files/ .
	# On s'assure que le serveur de prod n'est pas inclus dans le build
	RUN rm -f server.js
	RUN npm run build
	
	FROM node:22-slim
	WORKDIR /app
	
	# On copie les dependances de production
	COPY ./server_files/package*.json ./
	RUN npm install --omit=dev
	
	# On copie le code du serveur de production
	COPY ./server_files/server.js .
	
	# On copie les certificats
	COPY ./server_files/certs ./certs
	
	# On copie UNIQUEMENT les fichiers buildes de l'etape "builder"
	COPY --from=builder /app/dist ./dist
	
	# On expose le port HTTPS
	EXPOSE 443
	
	# La commande pour demarrer notre serveur de production
	CMD ["node", "server.js"]