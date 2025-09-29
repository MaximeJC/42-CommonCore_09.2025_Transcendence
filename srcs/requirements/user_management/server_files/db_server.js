const DEBUG_MODE = true;

import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifySecureSession from '@fastify/secure-session';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import fastifyWebsocket from '@fastify/websocket';
import crypto from 'crypto';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

import dbModule from './db.js';
import userRoutes from './routes/users.js';
import gameRoutes from './routes/games.js';
import friendRoutes from './routes/friends.js';
import leaderboardRoutes from './routes/leaderboard.js';
import { initializeWebSocket, userSocketMap } from './websocket/handlers.js';

const fastify = Fastify({ logger: true });

const { db, getUserByEmail, getUserByLogin } = dbModule;

// Point de depart du serveur
async function configure() {
	// Configuration des chemins
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);

	// Enregistrement des plugins (middlewares)
	await fastify.register(fastifyCookie);
	await fastify.register(fastifySecureSession, {
		key: crypto.randomBytes(32),
		cookie: {
			path: '/',
			httpOnly: true,
			secure: false, // Mettre à true en production (HTTPS)
			sameSite: 'lax',
		}
	});

	// CORS
	const allowedOrigins = [
		'http://localhost:5173',
		'http://127.0.0.1:5173',
		'http://localhost:5000',
		'http://127.0.0.1:5000',
	];

	await fastify.register(cors, {
		origin: (origin, cb) => {
			if (!origin) {
				return cb(null, true);
			}
			if (allowedOrigins.includes(origin)) {
				return cb(null, true);
			}

			if (origin.startsWith('http://10.') || origin.startsWith('http://192.') ||
				origin.startsWith('http://172.') ||  origin.startsWith('https://172.') ||
				origin.startsWith('https://10.') || origin.startsWith('https://192.') ||
				origin.startsWith('http://127.') || origin.startsWith('http://localhost') ||
				origin.startsWith('https://127.') || origin.startsWith('https://localhost'))
			{
				return cb(null, true);
			}
			cb(new Error(`Not allowed by CORS: ${origin}`));
		},
		credentials: true
	});

	// Gestion des fichiers (pour les avatars)
	await fastify.register(fastifyMultipart);
	await fastify.register(fastifyStatic, {
		root: path.join(__dirname, 'avatars'),
		prefix: '/uploads/',
	});

	// Enregistrement des WebSockets
	await fastify.register(fastifyWebsocket);

	const dependencies = {
		db,
		getUserByEmail,
		getUserByLogin,
		userSocketMap,
		DEBUG_MODE
	};

	// Enregistrement des routes
	fastify.register(userRoutes, { prefix: '/', deps: dependencies });
	fastify.register(gameRoutes, { prefix: '/', deps: dependencies });
	fastify.register(friendRoutes, { prefix: '/', deps: dependencies });
	fastify.register(leaderboardRoutes, { prefix: '/', deps: dependencies });

	initializeWebSocket(fastify, dependencies);

	fastify.get('/', async (request, reply) => {
		return { message: "Backend OK" };
	});
	fastify.get('/ping', async () => { return { msg: 'pong' }; });

	// Demarrage du serveur
	await fastify.listen({ port: 3000, host: '0.0.0.0' });
}

configure();