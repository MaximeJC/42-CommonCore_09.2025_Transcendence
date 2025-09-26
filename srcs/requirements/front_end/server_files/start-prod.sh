#!/bin/bash

echo "🚀 Starting production deployment..."

# Variables d'environnement
export PORT=${PORT:-5000}
export API_TARGET=${API_TARGET:-http://hgp_user_management:3000}

echo "📦 Building application..."
npm run build

echo "🔧 Starting production server..."
echo "Port: $PORT"
echo "API Target: $API_TARGET"

npm start
