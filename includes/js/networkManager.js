// js/networkManager.js

import { gameState } from './gameState.js';
import { endGame, resetBall } from './gameLogic.js';

// Adaptez l'URL a votre configuration serveur.
// Utilisez 'ws://' pour le developpement local sans SSL.
// Utilisez 'wss://' pour la production avec SSL.
const WS_URL = "ws://localhost:8000/ws/pong/"; // Exemple d'URL Django Channels

class NetworkManager {
	constructor() {
		this.socket = null;
	}

	connect(jwtToken) { // Le token si necessaire pour l'authentification
		return new Promise((resolve, reject) => {
			if (this.socket && this.socket.readyState === WebSocket.OPEN) {
				console.log("Deja connecte.");
				resolve();
				return;
			}

			console.log("Tentative de connexion au serveur de jeu...");
			// L'authentification se fait souvent en passant le token dans l'URL
			this.socket = new WebSocket(`${WS_URL}?token=${jwtToken}`);

			this.socket.onopen = () => {
				console.log("Connecte au serveur de jeu !");
				resolve();
			};

			this.socket.onclose = (event) => {
				console.log("Deconnecte du serveur de jeu.", event.reason);
				// Gerer la reconnexion ou afficher un message a l'utilisateur
			};

			this.socket.onerror = (error) => {
				console.error("Erreur WebSocket:", error);
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
			console.log("Message recu:", message);

			switch (message.type) {
				case 'game_start':
					gameState.isGameStarted = true;
					gameState.ui.startButton.mesh.isVisible = false;
					gameState.ui.winnerText.mesh.isVisible = false;
					gameState.ui.scoreLeft.mesh.isVisible = true;
					gameState.ui.scoreRight.mesh.isVisible = true;
					// On affiche le pseudo de l'adversaire
					console.log("La partie commence contre:", message.data.opponent_pseudo);
					break;

				case 'game_state_update':
					if (gameState.ball) {
						gameState.ball.position.z = message.data.ball_z;
						gameState.ball.position.y = message.data.ball_y;
					}
					
					gameState.ui.scoreLeft.textBlock.text = message.data.score_left;
					gameState.ui.scoreRight.textBlock.text = message.data.score_right;
					
					// Met a jour la position des raquettes controlees par le reseau
					gameState.activePlayers.forEach(player => {
						if (player.controlType === 'ONLINE') {
							// On suppose que le serveur envoie un objet avec les positions indexees par le nom du joueur
							// Ex: { "player_right_top": { "y": 10 }, "player_left_bottom": { "y": -5 } }
							if (message.data.players && message.data.players[player.config.name]) {
								player.mesh.position.y = message.data.players[player.config.name].y;
							}
						}
					});
					break;

				case 'goal_scored':
					// Le serveur nous informe d'un but, on reinitialise le visuel
					resetBall(gameState, message.data.ball_direction_z);
					break;

				case 'game_over':
					// Le serveur declare la fin de la partie
					endGame(gameState, message.data.winner_pseudo + " Wins!");
					break;
				
				case 'error':
					console.error("Erreur du serveur:", message.data.message);
					// On pourrait afficher cette erreur a l'utilisateur
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