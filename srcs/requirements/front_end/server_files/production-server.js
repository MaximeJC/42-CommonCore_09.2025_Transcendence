import 'dotenv/config';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Servir les fichiers statiques depuis le dossier dist
app.use(express.static(path.join(__dirname, 'dist')));

// Servir les fichiers publics (images, etc.)
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/includes', express.static(path.join(__dirname, 'public/includes')));
app.use('/public/uploads', express.static('/app/public/uploads'));

// Configuration du proxy pour les API
const API_TARGET = process.env.API_TARGET || 'http://localhost:3000';
const AI_SERVER_TARGET = process.env.AI_SERVER_TARGET || 'http://hgp_ai_server:3001';
const GAME_MANAGEMENT_TARGET = process.env.GAME_MANAGEMENT_TARGET || 'http://hgp_game_management:3003';

// Proxy HTTP pour les API REST
app.use('/api', createProxyMiddleware({
  target: API_TARGET,
  changeOrigin: true,
  pathRewrite: {
    '^/api': '',
  },
  // Gestion des WebSockets
  ws: true,
  onError: (err, req, res) => {
    console.error('API Proxy error:', err);
    if (res && !res.headersSent) {
      res.status(500).json({ error: 'API Proxy error' });
    }
  },
}));

// Proxy pour le serveur IA
app.use('/ai', createProxyMiddleware({
  target: AI_SERVER_TARGET,
  changeOrigin: true,
  pathRewrite: {
    '^/ai': '',
  },
  onError: (err, req, res) => {
    console.error('AI Server Proxy error:', err);
    if (res && !res.headersSent) {
      res.status(500).json({ error: 'AI Server Proxy error' });
    }
  },
}));

// Proxy pour le game management avec WebSocket
app.use('/game', createProxyMiddleware({
  target: GAME_MANAGEMENT_TARGET,
  changeOrigin: true,
  pathRewrite: {
    '^/game': '',
  },
  ws: true,
  onError: (err, req, res) => {
    console.error('Game Management Proxy error:', err);
    if (res && !res.headersSent) {
      res.status(500).json({ error: 'Game Management Proxy error' });
    }
  },
}));

// Fallback pour les routes SPA - renvoie toujours index.html
app.use((req, res, next) => {
  // Si c'est une requete pour un fichier existant, passez
  if (req.url.includes('.')) {
    return next();
  }
  // Sinon, servir index.html pour les routes SPA
  res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Production server running on port ${PORT}`);
  console.log(`Serving static files from: ${path.join(__dirname, 'dist')}`);
  console.log(`API proxy target: ${API_TARGET}`);
  console.log(`AI Server proxy target: ${AI_SERVER_TARGET}`);
  console.log(`Game Management proxy target: ${GAME_MANAGEMENT_TARGET}`);
  console.log(`WebSocket proxy enabled for /api/ws and /game/ws`);
});
