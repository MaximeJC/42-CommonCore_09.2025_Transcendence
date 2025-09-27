import Fastify						from 'fastify'; // importer fastify
import cors							from '@fastify/cors'; // permettra connexion au front
import fastifyCookie				from '@fastify/cookie';
import fastifySecureSession	from '@fastify/secure-session';
import fastifyMultipart			from '@fastify/multipart';
import fastifyStatic				from '@fastify/static';
import crypto						from 'crypto';
import path							from 'path';
import { fileURLToPath }		from 'url';
// import dbModule from './db.js' // importer cette fonction du fichier db.js
// import bcrypt from 'bcrypt';
// import validator from 'validator';
// import { dirname } from 'path';
// import { pipeline } from 'stream/promises'; // Pour gerer les flux proprement
// import fs from 'fs'; // Pour creer le flux d'ecriture
import fastifyWebsocket from '@fastify/websocket';

const DEBUG_MODE = true;

const fastify = Fastify({logger: true});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// plugins
await fastify.register(fastifyCookie);
await fastify.register(fastifySecureSession, {
	key: crypto.randomBytes(32), //generer une cle aleatoire
	cookie: {
		path: '/',
		httpOnly: true,
		secure: false,
		sameSite: 'lax',
		saveUninitialized: false
	}
});
await fastify.register(fastifyMultipart);
await fastify.register(fastifyStatic, {
	root: path.join(__dirname, 'uploads'),
	prefix: '/uploads/',
});

// lancer serveur
async function configure() {
	const allowedOrigins = [
		'http://localhost:5173',
		'http://127.0.0.1:5173',
	];
	await fastify.register(cors, {
		origin: (origin, cb) => {
			if (!origin) {
				return cb(null, true);
			}
			if (allowedOrigins.includes(origin)) {
				return cb(null, true);
			}

			if (origin.startsWith('http://10.') || origin.startsWith('http://192.') || origin.startsWith('http://172.') ||
				origin.startsWith('https://10.') || origin.startsWith('https://192.') || origin.startsWith('https://172.'))
			{
				return cb(null, true);
			}
			cb(new Error(`Not allowed by CORS: ${origin}`));
		},
		credentials: true
	});
	await fastify.register(fastifyWebsocket, {
		options: {
			origin: (origin, callback) => {
				if (!origin || /localhost/.test(origin)) {
					callback(null, true);
				} else {
					callback(new Error('Origin not allowed'), false);
				}
			}
		}
	});
		await fastify.listen({ port: 3000, host: '0.0.0.0' });
}

configure();

// racine de l'URL
fastify.get('/', async (request, reply)=>{ return { message: "Backend OK"}; });

// routes
import userRoutes				from './routes/users.js';
import gameRoutes				from './routes/games.js';
import friendRoutes			from './routes/friends.js';
import leaderboardRoutes	from './routes/leaderboard.js';
fastify.register(userRoutes);
fastify.register(gameRoutes,			{ prefix: '/games '});
fastify.register(friendRoutes,		{ prefix: '/friends '});
fastify.register(leaderboardRoutes,	{ prefix: '/leaderboard '});
