import 'dotenv/config';
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';
import https from 'https';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT_HTTP = 5173;
const PORT_HTTPS = 5000;

// Servir les fichiers statiques depuis le dossier dist
app.use(express.static(path.join(__dirname, 'dist')));

// Servir les fichiers publics (images, etc.)
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/includes', express.static(path.join(__dirname, 'public/includes')));
app.use('/uploads', express.static('/app/uploads'));

// Configuration du proxy pour les API
const API_TARGET = process.env.API_TARGET || 'http://hgp_user_management:3000'; 
const AI_SERVER_TARGET = process.env.AI_SERVER_TARGET || 'http://hgp_ai_server:3001'; 
const GAME_MANAGEMENT_TARGET = process.env.GAME_MANAGEMENT_TARGET || 'http://hgp_game_management:3003'; 

// Proxy HTTP pour les API REST 
const apiProxy = createProxyMiddleware({
	target: API_TARGET,
	changeOrigin: true,
	pathRewrite: { '^/api': '' }, 
	ws: true,
	onError: (err, req, res) => {
		console.error('API Proxy error:', err);
		if (res && !res.headersSent) {
			res.status(500).json({ error: 'API Proxy error' });
		}
	},
});

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
const agent = new https.Agent({
	ca: fs.readFileSync('/app/certs/hgp_https.crt'),
});

const gameProxy = createProxyMiddleware({
	target: GAME_MANAGEMENT_TARGET,
	changeOrigin: true,
	pathRewrite: { '^/game': '' },
	ws: true,
	// agent: agent,
	// secure: false, 
	onError: (err, req, res) => {
		console.error('Game Management Proxy error:', err);
		if (res && !res.headersSent) {
			res.status(500).json({ error: 'Game Management Proxy error' });
		}
	},
});

// Appliquer le proxy pour Express
app.use('/api', apiProxy);
app.use('/game', gameProxy);
// Fallback pour les routes SPA - renvoie toujours index.html 
app.use((req, res, next) => {
	if (req.url.includes('.')) {
		return next();
	}
	res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Gestion des erreurs
app.use((err, req, res, next) => {
	console.error('Server error:', err);
	res.status(500).json({ error: 'Internal server error' });
});

try {
	const sslOptions = {
		key: fs.readFileSync('/app/certs/hgp_https.key'),
		cert: fs.readFileSync('/app/certs/hgp_https.crt'),
	};

	// Serveur HTTPS principal
	const httpsServer = https.createServer(sslOptions, app);
	httpsServer.on('upgrade', (req, socket, head) => {
		// On verifie l'URL et on transmet la requete au bon proxy.
		if (req.url.startsWith('/game')) {
	   		gameProxy.upgrade(req, socket, head);
		} else if (req.url.startsWith('/api/ws')) {
		console.log('Redirection de la WebSocket vers le proxy de l\'API...');
			apiProxy.upgrade(req, socket, head);
		} else {
			// Si l'URL ne correspond pas, on ferme la connexion proprement.
			socket.destroy();
		}
	});
		httpsServer.listen(PORT_HTTPS, '0.0.0.0', () => {
		console.log(`HTTPS server listening on internal port ${PORT_HTTPS}`);
		console.log(`Serving static files from: ${path.join(__dirname, 'dist')}`);
		console.log(`API proxy target: ${API_TARGET}`);
		console.log(`AI Server proxy target: ${AI_SERVER_TARGET}`);
		console.log(`Game Management proxy target: ${GAME_MANAGEMENT_TARGET}`);
		console.log(`WebSocket proxy enabled for /api/ws and /game/ws`);
	});

	const httpServer = http.createServer((req, res) => {
		const hostname = req.headers.host.split(':')[0];
		const redirectUrl = `https://${hostname}:${PORT_HTTPS}${req.url}`;
		res.writeHead(301, { "Location": redirectUrl });
		res.end();
		res.end();
	});

	httpServer.listen(PORT_HTTP, '0.0.0.0', () => {
		console.log(`HTTP server running on port ${PORT_HTTP} and redirecting to HTTPS.`);
	});

} catch (error) {
	console.error('Failed to start server.', error);
}
