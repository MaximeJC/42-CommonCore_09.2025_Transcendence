import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT_HTTP = 8080;

// Servir les fichiers statiques depuis le dossier dist
app.use(express.static(path.join(__dirname, 'dist')));

// Servir les fichiers publics (images, etc.)
app.use('/images', express.static(path.join(__dirname, 'public/images')));
app.use('/includes', express.static(path.join(__dirname, 'public/includes')));
app.use('/uploads', express.static('/app/uploads'));

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
	// En mode production avec Caddy, on sert juste les fichiers statiques sans SSL
	// car c'est Caddy qui gère la terminaison SSL
	
	// Serveur HTTP simple pour servir les fichiers statiques
	const httpServer = http.createServer(app);
	
	httpServer.listen(PORT_HTTP, '0.0.0.0', () => {
		console.log(`HTTP server listening on internal port ${PORT_HTTP}`);
		console.log(`Serving static files from: ${path.join(__dirname, 'dist')}`);
		console.log(`Static images from: ${path.join(__dirname, 'public/images')}`);
		console.log(`Static includes from: ${path.join(__dirname, 'public/includes')}`);
		console.log(`Uploads from: /app/uploads`);
		console.log(`Caddy will handle SSL termination and reverse proxy`);
	});

} catch (error) {
	console.error('Failed to start server.', error);
}
