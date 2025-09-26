#!/bin/bash

echo "🛠️  Démarrage en mode DÉVELOPPEMENT..."
echo "Port: 5173"
echo "Mode: Development (Vite avec hot-reload)"

cd srcs

# Utiliser le fichier d'environnement de développement
docker-compose --env-file .env.dev up --build front_endh

echo "🛠️  Déploiement en mode DÉVELOPPEMENT..."
echo "Port: 5173"
echo "Mode: Development (Vite avec hot-reload)"

cd srcs

# Démarrer en mode développement avec hot-reload
docker-compose -f docker-compose.dev.yml up front_end
