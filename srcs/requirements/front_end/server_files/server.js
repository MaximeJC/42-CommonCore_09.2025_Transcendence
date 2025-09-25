import Fastify from 'fastify';
import path, { dirname }  from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import fastifyStatic from '@fastify/static';
import httpProxy from '@fastify/http-proxy';

// --- CONFIGURATION ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 443; // Port HTTPS par defaut

// --- CREATION DU SERVEUR FASTIFY ---
// On active le logger et on prepare la configuration HTTPS
const fastify = Fastify({
    logger: true,
    https: {
        key: fs.readFileSync(path.join(__dirname, 'certs', 'localhost+2-key.pem')),
        cert: fs.readFileSync(path.join(__dirname, 'certs', 'localhost+2.pem'))
    }
});

// --- REVERSE PROXY POUR L'API ---
// On recree la logique du proxy de Vite
await fastify.register(httpProxy, {
    upstream: 'http://user_management:3000', // Docker va resoudre ce nom
    prefix: '/api',
    websocket: true // Tres important pour les WebSockets !
});

await fastify.register(httpProxy, {
    upstream: 'http://game_management:3000',
    prefix: '/game-api',
    websocket: true
});

await fastify.register(httpProxy, {
    upstream: 'http://ai-server:3001',
    prefix: '/ai-api',
    websocket: true
});

// On sert le contenu du dossier 'dist' qui a ete builde
await fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'dist'),
    prefix: '/',
});

await fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'dist', 'images'),
    prefix: '/images/',
    decorateReply: false
});

await fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'dist', 'fonts'),
    prefix: '/fonts/',
    decorateReply: false
});

await fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'dist', 'public'),
    prefix: '/public/',
    decorateReply: false
});

await fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'dist', 'uploads'),
    prefix: '/uploads/',
    decorateReply: false
});

// Si une route n'est pas trouvee (ex: /profil), on renvoie index.html
fastify.setNotFoundHandler((req, reply) => {
    reply.sendFile('index.html');
});

// --- DEMARRAGE DU SERVEUR ---
const start = async () => {
    try {
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Serveur de production demarre sur https://localhost:${PORT}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();