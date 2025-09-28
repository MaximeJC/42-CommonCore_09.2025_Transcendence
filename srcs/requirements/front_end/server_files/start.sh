#!/bin/bash

# Script de démarrage intelligent
# Détecte le mode basé sur la variable d'environnement NODE_ENV

echo "Starting application..."
echo "NODE_ENV: ${NODE_ENV:-development}"

if [ "$NODE_ENV" = "production" ]; then
    echo "Production mode detected"
    echo "Building application for production..."
    npm run build
    echo "Starting production server..."
    node production-server.js
else
    echo "Development mode detected"
    echo "Starting Vite dev server with hot-reload..."
    npm run dev
fi
