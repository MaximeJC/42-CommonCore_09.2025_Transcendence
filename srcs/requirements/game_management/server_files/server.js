import fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { GameInstance } from './GameInstance.js';
import fs from 'fs';
import cors from '@fastify/cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = fastify({ logger: true });

const PORT = 3003;

await app.register(cors, {
	origin: (origin, cb) => {
		if (!origin) {
			return cb(null, true);
		}
		const allowedOrigins = [
			'http://10.', 'http://192.', 'http://172.',
			'https://10.', 'https://192.', 'https://172.',
			'http://127.', 'http://localhost',
			'https://127.', 'https://localhost'
		];
		if (allowedOrigins.some(pattern => origin.startsWith(pattern))) {
			return cb(null, true);
		}
		cb(new Error(`Origine non autorisee par CORS: ${origin}`));
	},
	credentials: true
});

app.register(fastifyStatic, {
	root: path.join(__dirname, '..', 'public'),
	prefix: '/',
});

const clients = new Map();
const games = new Map();
const matchmaking_1v1 = [];
const matchmaking_4p = [];
const privateWaitingRooms = new Map();

const PLAYER_TIMEOUT_MS = 60000;

app.post('/connect', (request, reply) => {
	const { pseudo, language, avatarUrl } = request.body;
	const clientId = uuidv4();
	clients.set(clientId, {
		id: clientId,
		pseudo: pseudo || 'Anonymous',
		language: language || 'en',
		avatarUrl: avatarUrl || '',
		gameId: null,
		lastSeen: Date.now()
	});
	console.log(`[Serveur] Nouveau client enregistre: ${pseudo} (ID: ${clientId})`);
	reply.send({ clientId });
});

app.post('/matchmaking/join', (request, reply) => {
	const { clientId, mode, opponentPseudo } = request.body;
	const clientInfo = clients.get(clientId);

	if (!clientInfo) {
		return reply.status(404).send({ error: 'Client not found' });
	}
	clientInfo.lastSeen = Date.now();

	if (['1P_VS_AI', 'AI_VS_AI', '2AI_VS_2AI', '2P_LOCAL'].includes(mode)) {
		const game = createGame([clientInfo], mode);
		reply.send({ status: 'found', gameId: game.gameId });
	}
	else if (['1V1_ONLINE', '2P_ONLINE'].includes(mode)) {
		handlePublicMatchmaking(clientInfo, matchmaking_1v1, 2, '1V1_ONLINE');
		reply.send({ status: 'in_queue' });
	}
	else if (mode === '4P_ONLINE') {
		handlePublicMatchmaking(clientInfo, matchmaking_4p, 4, '4P_ONLINE');
		reply.send({ status: 'in_queue' });
	}
	else if (mode === 'PRIVATE' && opponentPseudo) {
		handlePrivateMatchmaking(clientInfo, opponentPseudo, '1V1_ONLINE');
		reply.send({ status: 'in_queue_private' });
	} else {
		return reply.status(400).send({ error: `Game mode '${mode}' not recognized.` });
	}
});

app.get('/matchmaking/status/:clientId', (request, reply) => {
	const { clientId } = request.params;
	const clientInfo = clients.get(clientId);

	if (!clientInfo) {
		return reply.status(404).send({ error: 'Client not found' });
	}
	clientInfo.lastSeen = Date.now();

	if (clientInfo.gameId) {
		reply.send({ status: 'found', gameId: clientInfo.gameId });
	} else if ([...privateWaitingRooms.values()].some(room => room.player1.id === clientId)) {
		reply.send({ status: 'waiting_for_opponent' });
	} else {
		reply.send({ status: 'in_queue' });
	}
});

app.post('/:gameId/ready', (request, reply) => {
	const { gameId } = request.params;
	const { clientId } = request.body;
	const game = games.get(gameId);

	if (game) {
		game.handlePlayerReady(clientId);
		const client = clients.get(clientId);
		if (client) {
			client.lastSeen = Date.now();
		}
		reply.status(204).send();
	} else {
		reply.status(404).send({ error: 'Game not found' });
	}
});

app.post('/:gameId/input', (request, reply) => {
	const { gameId } = request.params;
	const { clientId, movement, movements } = request.body;
	const game = games.get(gameId);
	const clientInfo = clients.get(clientId);

	if (!game) return reply.status(404).send({ error: 'Game not found' });
	if (!clientInfo) return reply.status(404).send({ error: 'Client not found' });
	clientInfo.lastSeen = Date.now();

	if (movement !== undefined) {
		game.handlePlayerInput(clientId, movement);
	}
	if (movements) {
		game.handleLocalPlayersInput(clientId, movements);
	}
	reply.status(204).send();
});


app.get('/:gameId/state', (request, reply) => {
	const { gameId } = request.params;
	const { clientId } = request.query;
	const game = games.get(gameId);

	if (!game) {
		return reply.status(404).send({ error: 'Game not found' });
	}

	if (clientId) {
		const client = clients.get(clientId);
		if (client) {
			client.lastSeen = Date.now();
		}
	}

	const gameState = game.getSerializableState();
	reply.send(gameState);
});

function createGame(players, mode) {
	const game = new GameInstance(players, mode);
	games.set(game.gameId, game);
	players.forEach(p => {
		const client = clients.get(p.id);
		if (client) {
			client.gameId = game.gameId;
		}
	});
	console.log(`[Serveur] Partie ${game.gameId} creee en mode ${mode} avec ${players.length} joueurs.`);
	return game;
}

function handlePublicMatchmaking(playerInfo, queue, requiredPlayers, gameMode) {
	const isInQueue = queue.some(p => p.id === playerInfo.id);
	if (isInQueue) {
		console.log(`[Matchmaking] Le joueur ${playerInfo.pseudo} est deja en file d'attente.`);
		return;
	}
	queue.push(playerInfo);
	if (queue.length >= requiredPlayers) {
		createGame(queue.splice(0, requiredPlayers), gameMode);
	}
}

function handlePrivateMatchmaking(playerInfo, opponentPseudo, gameMode) {
	const roomKey = [playerInfo.pseudo, opponentPseudo].sort().join('_vs_');

	if (privateWaitingRooms.has(roomKey)) {
		const room = privateWaitingRooms.get(roomKey);
		if (playerInfo.pseudo === room.opponent_pseudo) {
			console.log(`[Partie Privee] ${playerInfo.pseudo} a rejoint ${room.player1.pseudo}. Lancement.`);
			createGame([room.player1, playerInfo], gameMode);
			privateWaitingRooms.delete(roomKey);
		} else {
			console.warn(`[Partie Privee] Tentative non autorisee sur la salle ${roomKey} par ${playerInfo.pseudo}`);
		}
	} else {
		console.log(`[Partie Privee] ${playerInfo.pseudo} cree une salle pour ${opponentPseudo}.`);
		privateWaitingRooms.set(roomKey, {
			player1: playerInfo,
			opponent_pseudo: opponentPseudo,
			gameMode: gameMode
		});
	}
}

setInterval(() => {
	const now = Date.now();
	for (const [gameId, game] of games.entries()) {
		let disconnectedPlayer = null;

		for (const player of game.gameState.activePlayers) {
			if (player.controlType.includes('HUMAN')) {
				const clientInfo = clients.get(player.id);
				if (clientInfo && (now - clientInfo.lastSeen) > PLAYER_TIMEOUT_MS) {
					disconnectedPlayer = player;
					break;
				}
			}
		}

		if (disconnectedPlayer) {
			console.log(`[Timeout] Le joueur ${disconnectedPlayer.pseudo} (ID: ${disconnectedPlayer.id}) a ete deconnecte pour inactivite.`);
			clearInterval(game.gameLoop);
			game.gameState.isGameStarted = false;

			const remainingPlayer = game.gameState.activePlayers.find(p => p.controlType.includes('HUMAN') && p.id !== disconnectedPlayer.id);
			let endMessage = "Opponent has left the game.";
			if (remainingPlayer) {
				endMessage = `${remainingPlayer.pseudo} Wins! (Opponent disconnected)`;
			}

			game.endGame({ endMessage: endMessage, winner: remainingPlayer?.pseudo, loser: disconnectedPlayer.pseudo });
			game.clientInfos.forEach(p => {
				if (clients.has(p.id)) clients.get(p.id).gameId = null;
			});

			setTimeout(() => games.delete(gameId), 10000);
		}
	}
}, 2000);

app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
	if (err) {
		app.log.error(err);
		process.exit(1);
	}
	console.log(`Serveur de jeu (HTTP API) ecoutant sur ${address}`);
});