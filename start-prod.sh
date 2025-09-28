#!/bin/bash

echo "Demarrage en mode PRODUCTION..."
echo "Port: 5000"
echo "Mode: Production (serveur Express optimise)"

cd srcs

# Utiliser le fichier d'environnement de production
docker-compose --env-file .env.prod up --build front_end
