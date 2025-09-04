// pong-server/server.js
import fastify from 'fastify';
import websocket from '@fastify/websocket';
import { v4 as uuidv4 } from 'uuid';
import { GameInstance } from './GameInstance.js';

const app = fastify({ logger: true });
const PORT = 3000;
app.register(websocket);

let matchmaking_1v1 = [];
let matchmaking_4p = [];
const games = new Map();
const clients = new Map();

app.register(async function (fastify) {
	fastify.get('/', { websocket: true }, (connection) => {
		const socket = connection;
		socket.id = uuidv4();
		clients.set(socket.id, { socket, gameId: null });
		console.log(`[Serveur] Client connecte: ${socket.id}`);

		socket.on('message', (message) => {
			try {
				const parsed = JSON.parse(message.toString());
				const clientInfo = clients.get(socket.id);

				switch(parsed.type) {
					case 'find_match':
						// On passe le socket et le pseudo a la fonction de matchmaking
						handleMatchmaking(socket, parsed.data.mode, parsed.data.pseudo);
						break;
					case 'player_input':
						if (clientInfo?.gameId) {
							games.get(clientInfo.gameId)?.handlePlayerInput(socket.id, parsed.data.movement);
						}
						break;
					case 'local_players_input':// Message special pour le 2P_LOCAL
						if (clientInfo?.gameId) {
							games.get(clientInfo.gameId)?.handleLocalPlayersInput(socket.id, parsed.data.movements);
						}
						break;
					// Ajout du cas client_ready pour la synchronisation
					case 'client_ready':
						if (clientInfo?.gameId) {
							games.get(clientInfo.gameId)?.handlePlayerReady(socket.id);
						}
						break;
				}
			} catch (e) { console.error('Erreur', e); }
		});

		socket.on('close', () => {
			console.log(`[Serveur] Client deconnecte: ${socket.id}`);
			const clientInfo = clients.get(socket.id);

			if (clientInfo && clientInfo.gameId) {
				const game = games.get(clientInfo.gameId);
				if (game && game.gameState.isGameStarted) {
					clearInterval(game.gameLoop);
					game.gameState.isGameStarted = false;

					const remainingPlayer = game.gameState.activePlayers.find(p => p.controlType.includes('HUMAN') && p.id !== socket.id);
					
					let endMessage;
					// Construire le message.
					if (remainingPlayer && remainingPlayer.pseudo) {
						endMessage = `Opponent has left. ${remainingPlayer.pseudo} wins!`;
					} else {
						endMessage = "Opponent has left the game.";
					}

					game.broadcast('game_over', { end_message: endMessage });
					
					console.log(`[Jeu ${game.gameId}] Partie terminee. ${endMessage}`);
					games.delete(clientInfo.gameId);
				}
			}
			
			clients.delete(socket.id);
			matchmaking_1v1 = matchmaking_1v1.filter(info => info.socket.id !== socket.id);
			matchmaking_4p = matchmaking_4p.filter(info => info.socket.id !== socket.id);
		});
	});
});

function handleMatchmaking(socket, gameMode, pseudo) {
	const playerInfo = { socket, pseudo }; // On cree l'objet info

	const isInQueue = matchmaking_1v1.some(p => p.socket.id === socket.id) || matchmaking_4p.some(p => p.socket.id === socket.id);
	if (isInQueue) {
		console.log(`[Matchmaking] Le joueur ${socket.id} est deja en file d'attente.`);
		return;
	}

	let game;
	const modesInstants = ['1P_VS_AI', 'AI_VS_AI', '2AI_VS_2AI', '2P_LOCAL'];
	if (modesInstants.includes(gameMode)) {
		game = new GameInstance([playerInfo], gameMode);
	} else if (['1V1_ONLINE', '2P_ONLINE'].includes(gameMode)) {
		matchmaking_1v1.push(playerInfo);
		if (matchmaking_1v1.length >= 2) {
			game = new GameInstance(matchmaking_1v1.splice(0, 2), '1V1_ONLINE');
		}
	} else if (gameMode === '4P_ONLINE') {
		matchmaking_4p.push(playerInfo);
		if (matchmaking_4p.length >= 4) {
			game = new GameInstance(matchmaking_4p.splice(0, 4), '4P_ONLINE');
		}
	} else {
		console.error(`[Matchmaking] Mode de jeu '${gameMode}' non reconnu.`);
		return;
	}

	if (game) {
		games.set(game.gameId, game);
		// On met a jour le gameId pour tous les sockets humains de la partie
		Object.values(game.sockets).forEach(playerSocket => {
			const client = clients.get(playerSocket.id);
			if (client) {
				client.gameId = game.gameId;
			}
		});
	}
}

app.listen(
	{
	port: PORT,
	host: '0.0.0.0'
	}
);