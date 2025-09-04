// js/networkManager.js

import { gameState } from './gameState.js';
import { endGame, resetBall, startCountdown } from './gameLogic.js';

const WS_URL = "ws://127.0.0.1:3000";

class NetworkManager {
	constructor() {
		this.socket = null;
	}

	connect(jwtToken) // Le token si necessaire pour l'authentification
	{
		return new Promise((resolve, reject) => {
			if (this.socket && this.socket.readyState === WebSocket.OPEN) {
				console.log("Deja connecte.");
				resolve();
				return;
			}

			console.log("Tentative de connexion au serveur de jeu...");
			this.socket = new WebSocket(WS_URL);

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
			// console.log("Message recu:", message); // Decommenter pour un debug intensif

			if (message.type === 'game_state_update') {
				const state = message.data;
				
				// Le client ne fait qu'obeir et appliquer les positions dictees par le serveur.
				if (gameState.ball) {
					gameState.ball.position.z = state.ball_z;
					gameState.ball.position.y = state.ball_y;
				}
				
				// Appliquer les scores.
				gameState.ui.scoreLeft.textBlock.text = state.score_left.toString();
				gameState.ui.scoreRight.textBlock.text = state.score_right.toString();
				
				// Appliquer la position de TOUS les joueurs geres par le serveur.
				// Cette boucle dynamique fonctionne pour 2 et 4 joueurs.
				for (const playerName in state.players) {
					const serverPlayerData = state.players[playerName];
					const clientPlayerObject = gameState.activePlayers.find(p => p.config.name === playerName);

					if (clientPlayerObject) {
						// On met a jour directement la position du mesh 3D.
						clientPlayerObject.mesh.position.y = serverPlayerData.y;
					}
				}
				return; // On a traite le message, on sort de la fonction.
			}


			// Pour les messages moins frequents qui gerent les evenements du jeu.
			switch (message.type) {
				case 'game_start':
					console.log("Le serveur a lance la partie contre:", message.data.opponent_pseudo);
					gameState.isGameStarted = true;
					gameState.ui.startButton.mesh.isVisible = false;
					gameState.ui.statusText.mesh.isVisible = false;
					gameState.ui.winnerText.mesh.isVisible = false;
					gameState.ui.scoreLeft.mesh.isVisible = true;
					gameState.ui.scoreRight.mesh.isVisible = true;
					gameState.ball.isVisible = true;
					
					startCountdown(gameState);
					break;

				case 'goal_scored':
					console.log("Un but a ete marque !");
				
					resetBall(gameState);
					break;

				case 'game_over':
					console.log("La partie est terminee.");
					gameState.ball.isVisible = false;
					gameState.ui.winnerText.textBlock.fontSize = '45%';
					const finalMessage = message.data.end_message;
					endGame(gameState, finalMessage);
					
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