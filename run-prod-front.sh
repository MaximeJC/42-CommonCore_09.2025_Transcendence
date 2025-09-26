#!/bin/bash

echo "🚀 Lancement du front-end en mode PRODUCTION"
echo "Port: 5000"
echo "Serveur: Express optimisé"

cd "$(dirname "$0")/srcs"

# Lancer uniquement le front-end en production
docker-compose -f docker-compose.prod.yml up --build front_end_prod
