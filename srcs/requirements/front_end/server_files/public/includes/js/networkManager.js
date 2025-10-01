import { gameState } from './gameState.js';
import { endGame, resetBall, startCountdown } from './gameLogic.js';
import { returnToLobby } from './app.js'

const API_URL = '/game';

// console.log(`Connexion API a l'adresse: ${API_URL}`);

let mainAppInitializer = null;

export function setAppInitializer(initializer) {
	mainAppInitializer = initializer;
}

class NetworkManager {
	constructor() {
		this.clientId = null;
		this.gameId = null;
		this.matchmakingPollInterval = null;
		this.gameStatePollInterval = null;
		this.inputPollInterval = null;
		this.lastKnownStateStatus = null;
		this.localMovement = { movement: 0 };
	}

	async connect() {
		if (this.clientId) {
			// console.log("Deja enregistre avec le clientId:", this.clientId);
			gameState.isConnected = true;
			return;
		}
		// console.log("Tentative d'enregistrement aupres du serveur de jeu...");
		try {
			const response = await fetch(`${API_URL}/connect`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					pseudo: gameState.pseudo,
					language: gameState.language,
					avatarUrl: gameState.avatarUrl
				})
			});
			if (!response.ok) throw new Error(`Erreur serveur: ${response.statusText}`);
			const data = await response.json();
			this.clientId = data.clientId;
			gameState.myClientId = this.clientId;
			gameState.isConnected = true;
			// console.log("Enregistre avec succes ! ClientId:", this.clientId);
		} catch (error) {
			console.error("Erreur lors de la connexion initiale:", error);
			gameState.isConnected = false;
			throw error;
		}
	}

	handleServerMessage(state) {

		if (gameState.ball) {
			gameState.ball.position.z = state.ball_z;
			gameState.ball.position.y = state.ball_y;
		}

		if (gameState.ui && gameState.ui.scoreLeft && gameState.ui.scoreRight) {
			gameState.ui.scoreLeft.textBlock.text = state.score_left.toString();
			gameState.ui.scoreRight.textBlock.text = state.score_right.toString();
		}

		for (const playerName in state.players) {
			const serverPlayerData = state.players[playerName];
			const clientPlayerObject = gameState.activePlayers.find(p => p.config.name === playerName);

			if (clientPlayerObject) {
				clientPlayerObject.mesh.position.y = serverPlayerData.y;
			}
		}
		
		const currentStateStatus = state.status;
		if (this.lastKnownStateStatus !== currentStateStatus) {
			// console.log(`Changement d'etat: ${this.lastKnownStateStatus || 'null'} -> ${currentStateStatus}`);
			switch (currentStateStatus) {
				case 'countdown': startCountdown(gameState); break;
				case 'playing': break;
				case 'finished':
					this.stopPolling();
					if (gameState.ball) gameState.ball.isVisible = false;
					endGame(gameState, state.end_message);
					const finalMessage = state.end_message || `${state.winner} Wins!`;
						endGame(gameState, finalMessage);
					window.dispatchEvent(new CustomEvent('gameresult', { detail: { ...state } }));
					returnToLobby(true);
					break;
			}
			this.lastKnownStateStatus = currentStateStatus;
		}
	}

	sendMessage(type, data = {}) {
		if (type === 'find_match' || type === 'create_private_match') {
			this.findMatch(data.mode, data.opponent_pseudo);
		} else if (type === 'player_input' || type === 'local_players_input') {
			const payload = data.movement !== undefined ? { movement: data.movement } : { movements: data.movements };
			this.localMovement = payload;
		} else if (type === 'client_ready') {
			this.sendClientReady();
		} else {
			console.warn(`sendMessage non implemente pour le type: ${type}`);
		}
	}

	updatePlayerInput(data) {
		this.localMovement = data.movement !== undefined ? { movement: data.movement } : { movements: data.movements };
	}

	async findMatch(mode, opponentPseudo = null) {
		if (!this.clientId) return;
		try {
			const response = await fetch(`${API_URL}/matchmaking/join`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ clientId: this.clientId, mode, opponentPseudo })
			});
			if (!response.ok) throw new Error("Erreur lors de la demande de matchmaking");
			
			const data = await response.json();
			if (data.status === 'found' && data.gameId) {
				this.gameId = data.gameId;
				this.prepareGameScene();
			} else {
				this.startMatchmakingPolling();
			}
		} catch (error) {
			console.error(error);
		}
	}

	startMatchmakingPolling() {
		this.stopPolling();
		// console.log("En attente d'autres joueurs... Debut du polling de matchmaking...");
		this.matchmakingPollInterval = setInterval(async () => {
			try {
				const response = await fetch(`${API_URL}/matchmaking/status/${this.clientId}`);
				if (!response.ok) throw new Error("Erreur de polling matchmaking.");
				const data = await response.json();
				if (data.status === 'found') {
					this.stopPolling();
					this.gameId = data.gameId;
					this.prepareGameScene();
				}
			} catch (error) {
				console.error(error);
				this.stopPolling();
			}
		}, 2000);
	}

	async prepareGameScene() {
		if (!this.gameId || !this.clientId) return;
		// console.log("Partie trouvee ! ID:", this.gameId, ". Preparation de la scene.");
		try {
			const initialResponse = await fetch(`${API_URL}/${this.gameId}/state?clientId=${this.clientId}`);
			if (!initialResponse.ok) {
				throw new Error(`Impossible de recuperer l'etat initial du jeu. Statut: ${initialResponse.status}`);
			}
			const initialState = await initialResponse.json();
			gameState.myPlayerName = this.findMyPlayerName(initialState.players);
			gameState.allPlayersInfo = initialState.all_players;
			
			if (mainAppInitializer) mainAppInitializer();
			else console.error("Erreur critique: Initialiseur de l'application non fourni.");
		} catch (error) {
			console.error(error);
			returnToLobby(false);
		}
	}
	
	async sendClientReady() {
		if (!this.gameId || !this.clientId) return;
		// console.log("Client pret, notification au serveur pour demarrer la partie...");
		try {
			await fetch(`${API_URL}/${this.gameId}/ready`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ clientId: this.clientId })
			});
			this.startPollingLoops();
		} catch (error) {
			console.error("Erreur lors de l'envoi du statut 'ready':", error);
		}
	}

	startPollingLoops() {
		this.stopPolling();

		this.gameStatePollInterval = setInterval(async () => {
			if (!this.gameId) return this.stopPolling();
			try {
				const response = await fetch(`${API_URL}/${this.gameId}/state?clientId=${this.clientId}`);
				if (response.status === 404) {
					// console.log("Partie terminee (le serveur a renvoye 404).");
					this.stopPolling();
					returnToLobby(false);
					return;
				}
				if (!response.ok) return;
				const state = await response.json();
				this.handleServerMessage(state);
			} catch (error) {}
		}, 1000 / 30);

		this.inputPollInterval = setInterval(() => {
			if (!this.gameId) return this.stopPolling();
			this.sendPlayerInput(this.localMovement);
		}, 1000 / 20);
	}

	async sendPlayerInput(movementData) {
		if (!this.gameId || !this.clientId) return;
		try {
			await fetch(`${API_URL}/${this.gameId}/input`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ clientId: this.clientId, ...movementData })
			});
		} catch (error) {
			if (error instanceof TypeError && error.message.includes("Failed to fetch")) return;
			console.error("Erreur lors de l'envoi de l'input:", error);
		}
	}

	findMyPlayerName(players) {
		if (gameState.gameMode === '2P_LOCAL') return 'both';
		if (['AI_VS_AI', '2AI_VS_2AI'].includes(gameState.gameMode)) return 'spectator';
		for (const name in players) {
			if (players[name].id === this.clientId) return name;
		}
		return 'spectator';
	}

	stopPolling() {
		clearInterval(this.matchmakingPollInterval);
		clearInterval(this.gameStatePollInterval);
		clearInterval(this.inputPollInterval);
		this.matchmakingPollInterval = null;
		this.gameStatePollInterval = null;
		this.inputPollInterval = null;
	}
}

export const networkManager = new NetworkManager();