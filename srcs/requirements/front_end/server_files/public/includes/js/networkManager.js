// js/networkManager.js

import { gameState } from './gameState.js';
import { endGame, resetBall, startCountdown } from './gameLogic.js';
import { returnToLobby } from './app.js'

// On determine le protocole WebSocket. Si la page est en HTTPS, on utilise 'wss:', sinon 'ws:'.
const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

// On recupere l'hote (domaine + port) de la page actuelle.
// 
const host = window.location.host;

// On assemble l'URL complete du WebSocket.
// const WS_URL = `${protocol}//localhost:3003`;
const hostname = window.location.hostname;
const WS_URL = `${protocol}//${hostname}:3003`;

console.log(`Connexion WebSocket a l'adresse: ${WS_URL}`);

// On cree une variable "boite" pour stocker la fonction initializeApp.
let mainAppInitializer = null;

/**
 * Permet a app.js de "donner" sa fonction initializeApp au networkManager.
 * @param {function} initializer - La fonction a appeler quand le jeu doit demarrer.
 */
export function setAppInitializer(initializer) {
	mainAppInitializer = initializer;
}


class NetworkManager {
	constructor() {
		this.socket = null;
	}

	connect(jwtToken) // Le token si necessaire pour l'authentification
	{
		return new Promise((resolve, reject) => {
			if (this.socket && this.socket.readyState === WebSocket.OPEN) {
				console.log("Deja connecte.");
				gameState.isConnected = true;
				resolve();
				return;
			}

			console.log("Tentative de connexion au serveur de jeu...");
			// const netConfig = window.networkConfig;
			// const WS_URL = netConfig.pongServerBaseUrl;

			// if (!WS_URL) {
			// 	const error = new Error("La configuration réseau (window.networkConfig.pongServerBaseUrl) est introuvable !");
			// 	console.error(error);
			// 	return reject(error);
			// }

			// console.log(`URL WebSocket absolue construite: ${WS_URL}`);
			this.socket = new WebSocket(WS_URL);

			this.socket.onopen = () => {
				console.log("Connecte au serveur de jeu !");
				this.sendMessage('client_hello', {
					pseudo: gameState.pseudo,
					language: gameState.language,
					avatarUrl: gameState.avatarUrl
					});
				gameState.isConnected = true;
				resolve();
			};

			this.socket.onclose = (event) => {
				console.log("Deconnecte du serveur de jeu.", event.reason);
				gameState.isConnected = false;
				// Gerer la reconnexion ou afficher un message a l'utilisateur
			};

			this.socket.onerror = (error) => {
				console.error("Erreur WebSocket:", error);
				gameState.isConnected = false;
				reject(error);
			};

			this.socket.onmessage = (event) => {
				this.handleServerMessage(event.data);
			};
		});
	}

	handleServerMessage(data) {
		try {
			const message = JSON.parse(data);
			// console.log("Message recu:", message); // Decommenter pour un debug intensif

			// C'est le message qui declenche la creation de la scene de jeu.
			if (message.type === 'game_start') {
				console.log("Le serveur a lance la partie ! Mon role est:", message.data.your_player_name);
				
				// On sauvegarde qui nous sommes dans le gameState.
				gameState.myPlayerName = message.data.your_player_name;

				// On stocke les informations de tous les joueurs (y compris les pseudos).
				if (message.data.all_players) {
					gameState.allPlayersInfo = message.data.all_players;
				}
				
				// On appelle la fonction principale de l'application.
				if (mainAppInitializer) {
					mainAppInitializer();
				} else {
					console.error("Erreur critique: l'initialiseur de l'application (initializeApp) n'a pas ete fourni au networkManager.");
				}
				return;
			}

			if (message.type === 'game_state_update') {
				const state = message.data;
				
				if (gameState.ball) {
					gameState.ball.position.z = state.ball_z;
					gameState.ball.position.y = state.ball_y;
				}

				// Appliquer les scores.
				if (gameState.ui.scoreLeft && gameState.ui.scoreRight) {
					gameState.ui.scoreLeft.textBlock.text = state.score_left.toString();
					gameState.ui.scoreRight.textBlock.text = state.score_right.toString();
				}
				
				// Appliquer la position de TOUS les joueurs geres par le serveur.
				for (const playerName in state.players) {
					const serverPlayerData = state.players[playerName];
					const clientPlayerObject = gameState.activePlayers.find(p => p.config.name === playerName);

					if (clientPlayerObject) {
						clientPlayerObject.mesh.position.y = serverPlayerData.y;
						// On met a jour le pseudo si le serveur nous en envoie un nouveau (pourrait etre utile plus tard)
						if (serverPlayerData.pseudo) {
							clientPlayerObject.config.pseudo = serverPlayerData.pseudo;
						}
					}
				}
				return;
			}

			// Pour les messages moins frequents qui gerent les evenements du jeu.
			switch (message.type) {
				case 'connection_established':
					console.log("Connexion etablie avec le serveur.");
					// On stocke la langue dans notre etat de jeu global.
					gameState.myClientId = message.data.clientId;
					break;
				case 'start_countdown':
					console.log("Ordre du serveur: demarrer le decompte !");
					startCountdown(gameState);
					break;

				case 'goal_scored':
					console.log("Un but a ete marque !");
					resetBall(gameState);
					break;

				case 'game_over':
					console.log("La partie est terminee.");
					if (gameState.ball) {
						gameState.ball.isVisible = false;
					}
					const endData = message.data;
					const finalMessage = message.data.end_message;
					if (!endData.winner)
						returnToLobby(false);
					// On peut maintenant afficher ou utiliser les autres donnees
					console.log("Partie terminee. Stats :");
					console.log("- Vainqueur:", endData.winner);
					console.log("- Perdant:", endData.loser);
					console.log("- Duree:", endData.duration, "secondes");
					console.log("gameMode:", endData.gameMode);
					console.log("game_id:", endData.gameId);
					endGame(gameState, finalMessage);

					//test partage donnees sur front
					const gameResultEvent = new CustomEvent('gameresult', {
					detail: message.data
						});
					window.dispatchEvent(gameResultEvent);
					returnToLobby(true);
					break;
				
				case 'error':
					console.error("Erreur renvoyee par le serveur:", message.data.message);
					break;
			}
		} catch (e) {
			console.error("Erreur de traitement du message serveur:", e);
		}
	}

	sendMessage(type, data = {}) {
		if (this.socket && this.socket.readyState === WebSocket.OPEN) {
			this.socket.send(JSON.stringify({ type, data }));
		} else {
			console.error("Impossible d'envoyer le message : WebSocket non connecte.");
		}
	}
}

export const networkManager = new NetworkManager();