// pong-server/server.js
import fastify from 'fastify';
import websocket from '@fastify/websocket';
import fastifyStatic from '@fastify/static'
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { GameInstance } from './GameInstance.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = fastify({ logger: true });
const PORT = 3000;

export let serverLanguage = 'es'; // 'en', 'fr', 'es'

app.register(fastifyStatic, {
	root: path.join(__dirname, '..', 'public'),
	prefix: '/', // Servir depuis la racine (ex: /index.html)
});

app.register(websocket);

let matchmaking_1v1 = [];
let matchmaking_4p = [];
// structure pour partie privee
const privateWaitingRooms = new Map();
const games = new Map();
const clients = new Map();

app.register(async function (fastify) {
	fastify.get('/', { websocket: true }, (connection) => {
		const socket = connection;
		socket.id = uuidv4();
		clients.set(socket.id, { socket, gameId: null });
		console.log("[Serveur] Client connecte: ${socket.id}");

		const welcomeMessage = {
			type: 'connection_established',
			data: {
				clientId: socket.id,
				server_language: serverLanguage
			}
		};
		socket.send(JSON.stringify(welcomeMessage));

		socket.on('message', (message) => {
			try {
				const parsed = JSON.parse(message.toString());
				if (parsed.data && parsed.data.language) {
					serverLanguage = parsed.data.language;
					console.log(`[Serveur] Langue changee en: ${serverLanguage}`);
				}
				const clientInfo = clients.get(socket.id);

				switch(parsed.type) {
					case 'find_match':
						// On passe le socket et le pseudo a la fonction de matchmaking
						handleMatchmaking(socket, parsed.data.mode, parsed.data.pseudo, parsed.data.language, parsed.data.avatarUrl);
						break;
					// Pour partie privee
					case 'create_private_match':
						handlePrivateMatchmaking(socket, parsed.data.my_pseudo, parsed.data.opponent_pseudo, parsed.data.mode, parsed.data.language, parsed.data.avatarUrl);
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
			console.log("[Serveur] Client deconnecte: ${socket.id}");
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
						const lang = remainingPlayer.language || 'en';
						const winnerPseudo = remainingPlayer.pseudo;
						let opponentLeftText;
						let winText;
						if (lang === 'fr') {
							winText = `${winnerPseudo} gagne !`;
						} else if (lang === 'es') {
							winText = `¡${winnerPseudo} gana!`;
						} else {
							winText = `${winnerPseudo} Wins!`;
						}
						if (lang === 'fr') {
							opponentLeftText = "L'adversaire a quitte.\n";
						} else if (lang === 'es') {
							opponentLeftText = "El oponente se ha ido.\n";
						} else {
							opponentLeftText = "Opponent has left.\n";
						}
						endMessage = opponentLeftText + winText;
					} else {
						endMessage = "Opponent has left the game.";
					}

					game.broadcast('game_over', { end_message: endMessage });
					
					console.log("[Jeu ${game.gameId}] Partie terminee. ${endMessage}");
					games.delete(clientInfo.gameId);
				}
			}
			
			clients.delete(socket.id);
			matchmaking_1v1 = matchmaking_1v1.filter(info => info.socket.id !== socket.id);
			matchmaking_4p = matchmaking_4p.filter(info => info.socket.id !== socket.id);
		});
	});
});

function handleMatchmaking(socket, gameMode, pseudo, language, avatarUrl) {
	const playerInfo = { socket, pseudo, language: language || 'en', avatarUrl: avatarUrl }; // On cree l'objet info

	const isInQueue = matchmaking_1v1.some(p => p.socket.id === socket.id) || matchmaking_4p.some(p => p.socket.id === socket.id);
	if (isInQueue) {
		console.log("[Matchmaking] Le joueur ${socket.id} est deja en file d'attente.");
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
		console.error("[Matchmaking] Mode de jeu '${gameMode}' non reconnu.");
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

/**
 * Pour gerer le matchmaking prive.
 */
function handlePrivateMatchmaking(socket, myPseudo, opponentPseudo, gameMode, language, avatarUrl) {
	const playerInfo = { socket, pseudo: myPseudo, language: language || 'en', avatarUrl: avatarUrl };

	// La cle de la salle est basee sur les pseudos tries, pour que "A vs B" et "B vs A" soient identiques.
	const roomKey = [myPseudo, opponentPseudo].sort().join('_vs_');

	if (privateWaitingRooms.has(roomKey)) {
		const room = privateWaitingRooms.get(roomKey);
		
		// Verifier que le joueur qui rejoint est bien celui qui etait attendu.
		if (myPseudo === room.opponent_pseudo) {
			console.log("[Partie Privee] ${myPseudo} a rejoint ${room.player1.pseudo}. Lancement de la partie.");
			const player1 = room.player1;
			const player2 = playerInfo;
			
			// Determiner le mode de jeu (par exemple, 1v1 par defaut pour les matchs prives)
			const finalGameMode = gameMode || '1V1_ONLINE';

			const game = new GameInstance([player1, player2], finalGameMode);
			if (game) {
				games.set(game.gameId, game);
				[player1.socket, player2.socket].forEach(sock => {
					const client = clients.get(sock.id);
					if (client) client.gameId = game.gameId;
				});
			}
			privateWaitingRooms.delete(roomKey);
		} else {
			// Un intrus essaie de rejoindre la partie.
			console.warn("[Partie Privee] Tentative de connexion non autorisee a la salle ${roomKey} par ${myPseudo}");
		}
	} else {
		// La salle n'existe pas, on la cree.
		console.log("[Partie Privee] ${myPseudo} a cree une salle pour jouer contre ${opponentPseudo}.");
		privateWaitingRooms.set(roomKey, {
			player1: playerInfo,
			opponent_pseudo: opponentPseudo,
			gameMode: gameMode
		});
		// On pourrait envoyer un message au joueur 1 pour lui dire "En attente de votre adversaire..."
		const waitingMessage = { type: 'waiting_for_opponent', data: { opponent: opponentPseudo } };
		socket.send(JSON.stringify(waitingMessage));
	}
}

app.listen(
	{
	port: PORT,
	host: '0.0.0.0'
	}
);