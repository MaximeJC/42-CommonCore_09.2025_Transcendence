#!/bin/bash

echo "Demarrage en mode DÉVELOPPEMENT..."
echo "Port: 5173"
echo "Mode: Development (Vite avec hot-reload)"

cd srcs

# Utiliser le fichier d'environnement de developpement
docker-compose --env-file .env.dev up --build front_endh

echo "Deploiement en mode DEVELOPPEMENT..."
echo "Port: 5173"
echo "Mode: Development (Vite avec hot-reload)"

cd srcs

# Demarrer en mode developpement avec hot-reload
docker-compose -f docker-compose.dev.yml up front_end
