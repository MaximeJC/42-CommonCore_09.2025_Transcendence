// pong-server/GameInstance.js

import { v4 as uuidv4 } from 'uuid';
import { createInitialGameState } from './game/gameState.js';
import * as GameLogic from './game/gameLogic.js';
import { limitUp2v2, limitDown2v2, limitUp4v4, limitDown4v4, iaResponseTime } from './game/config.js';

const TICK_RATE = 60;

export class GameInstance {
	constructor(clientInfos, gameMode) { // On recoit des 'infos' { socket, pseudo }
		this.gameId = uuidv4();
		this.sockets = {};
		this.gameState = createInitialGameState();
		this.gameState.gameMode = gameMode;

		if (gameMode === '4P_ONLINE' || gameMode === '2AI_VS_2AI') {
            this.gameState.limitUp = limitUp4v4;
            this.gameState.limitDown = limitDown4v4;
        } else {
            this.gameState.limitUp = limitUp2v2;
            this.gameState.limitDown = limitDown2v2;
        }

		this.aiCooldown = 0;
		this.iaResponseTime = iaResponseTime;
		// On utilise un Set pour stocker les IDs des joueurs qui ont confirme etre prets.
		this.readyPlayers = new Set();
		
		console.log(`[Jeu ${this.gameId}] Creation d'une partie en mode ${gameMode}.`);
		this.setupPlayers(clientInfos, gameMode);

		// On ne lance pas le jeu immediatement, on notifie les clients de se preparer.
		this.notifyClientsToPrepare();
	}

	setupPlayers(clientInfos, gameMode) { // Le parametre est 'clientInfos'
		const players = this.gameState.activePlayers;
		let humanPlayerIndex = 0;

		const createPlayer = (defaultPseudo, name, controlType) => {
			let id;
			let pseudo = defaultPseudo; // On garde un pseudo par defaut pour les IA

			// Logique d'assignation d'ID adaptee a tous les cas
			if (controlType.includes('HUMAN')) {
				if (clientInfos[humanPlayerIndex]) {
					const info = clientInfos[humanPlayerIndex];
					id = info.socket.id;
					pseudo = info.pseudo; // On utilise le pseudo fourni par le client
					// On stocke le socket pour pouvoir communiquer avec ce joueur
					this.sockets[id] = info.socket;
				} else {
					id = `human_${humanPlayerIndex}`;
				}
				humanPlayerIndex++;
			} else {
				id = `AI_${uuidv4()}`;
			}
			return { id, pseudo, name, y: 0, movement: 0, controlType };
		};

		switch (gameMode) {
			case 'AI_VS_AI':
				players.push(createPlayer("Bimo", 'player_left_top', 'AI'));
				players.push(createPlayer("Hecate", 'player_right_top', 'AI'));
				break;
			
			case '1P_VS_AI':
				players.push(createPlayer("Player 1", 'player_left_top', 'HUMAN'));
				players.push(createPlayer("Bimo", 'player_right_top', 'AI'));
				break;

			case '2P_LOCAL':
				players.push(createPlayer("Player 1", 'player_left_top', 'HUMAN_LOCAL'));
				players.push(createPlayer("Player 2", 'player_right_top', 'HUMAN_LOCAL'));
				// On s'assure que les deux joueurs partagent le meme ID de socket
				if (players.length === 2) {
					players[1].id = players[0].id;
				}
				break;

			case '1V1_ONLINE':
				players.push(createPlayer("Player 1", 'player_left_top', 'HUMAN'));
				players.push(createPlayer("Player 2", 'player_right_top', 'HUMAN'));
				break;

			case '2AI_VS_2AI':
				players.push(createPlayer("Bimo", 'player_left_top', 'AI'));
				players.push(createPlayer("Spiderman", 'player_left_bottom', 'AI'));
				players.push(createPlayer("Hecate", 'player_right_top', 'AI'));
				players.push(createPlayer("Roger", 'player_right_bottom', 'AI'));
				break;
			
			case '4P_ONLINE':
				players.push(createPlayer("Player 1", 'player_left_top', 'HUMAN'));
				players.push(createPlayer("Player 2", 'player_left_bottom', 'HUMAN'));
				players.push(createPlayer("Player 3", 'player_right_top', 'HUMAN'));
				players.push(createPlayer("Player 4", 'player_right_bottom', 'HUMAN'));
				break;

			default:
				console.error(`[Jeu ${this.gameId}] Mode de jeu '${gameMode}' inconnu. Creation d'une partie 1v1 par defaut.`);
				players.push(createPlayer("Player 1", 'player_left_top', 'HUMAN'));
				players.push(createPlayer("Player 2", 'player_right_top', 'HUMAN'));
				break;
		}
	}

	/**
	 * Notifie les clients qu'une partie est trouvee et qu'ils doivent commencer a se preparer.
	 */
	notifyClientsToPrepare() {
		const humanPlayers = this.gameState.activePlayers.filter(p => p.controlType.includes('HUMAN'));
		
		// Cas special pour 2P_LOCAL ou un seul client recoit les infos pour les deux joueurs
		if (this.gameState.gameMode === '2P_LOCAL' && humanPlayers.length > 0) {
			const clientSocket = this.sockets[humanPlayers[0].id];
			if (clientSocket && clientSocket.readyState === 1) {
				const message = {
					type: 'game_start',
					data: {
						your_player_name: 'both', // Signal special pour le client
						all_players: this.gameState.activePlayers.map(p => ({ name: p.name, pseudo: p.pseudo }))
					}
				};
				clientSocket.send(JSON.stringify(message));
			}
		} else {
			// Logique standard pour les autres modes
			humanPlayers.forEach(player => {
				const socket = this.sockets[player.id];
				if (socket && socket.readyState === 1) {
					const message = {
						type: 'game_start',
						data: {
							your_player_name: player.name,
							all_players: this.gameState.activePlayers.map(p => ({ name: p.name, pseudo: p.pseudo }))
						}
					};
					socket.send(JSON.stringify(message));
				}
			});
		}
	}

	/**
	 * appelee par le serveur quand un client envoie 'client_ready'.
	 */
	handlePlayerReady(playerId) {
		console.log(`[Jeu ${this.gameId}] Le joueur ${playerId} est pret.`);
		this.readyPlayers.add(playerId);

		const humanPlayerCount = Object.keys(this.sockets).length;

		// On verifie si TOUS les joueurs humains sont prets.
		if (this.readyPlayers.size === humanPlayerCount) {
			console.log(`[Jeu ${this.gameId}] Tous les joueurs sont prets. Lancement du jeu !`);
			this.beginGame();
		}
	}

	/**
	 * lance reellement la boucle de jeu et le decompte.
	 */
	beginGame() {
		this.gameState.isGameStarted = true;
		
		// On donne l'ordre a tous les clients de demarrer leur decompte visuel.
		this.broadcast('start_countdown', {});

		let initialDirection;
		if (Math.random() < 0.5) {
			initialDirection = 1;
		} else {
			initialDirection = -1;
		}
		GameLogic.resetBall(this.gameState, initialDirection);
		
		// Le serveur lance son propre decompte logique interne.
		setTimeout(() => {
			this.gameState.isBallPaused = false;
		}, 3000);

		// La boucle de jeu est lancee.
		this.gameLoop = setInterval(() => {
			this.update();
		}, 1000 / TICK_RATE);
	}

	update() {
		if (!this.gameState.isGameStarted) return;
		
		const deltaTimeInMs = 1000 / TICK_RATE;
		this.aiCooldown += deltaTimeInMs;
		if (this.aiCooldown >= this.iaResponseTime) {
			GameLogic.updateAIMovement(this.gameState);
			this.aiCooldown = 0;
		}

		const deltaTimeInSeconds = deltaTimeInMs / 1000;
		GameLogic.updatePlayers(deltaTimeInSeconds, this.gameState);
		GameLogic.updateBall(deltaTimeInSeconds, this.gameState,
			() => {
				this.broadcast('goal_scored', {});
				this.gameState.isBallPaused = true;
				setTimeout(() => { this.gameState.isBallPaused = false; }, 3000);
			},
			(winnerPseudo) => { this.endGame(winnerPseudo); }
		);
		this.broadcastState();
	}
		
	handlePlayerInput(playerId, movement) {
		const player = this.gameState.activePlayers.find(p => p.id === playerId);
		if (player && player.controlType === 'HUMAN') {
			player.movement = movement;
		}
	}

	/**
	 * Fonction pour gerer les inputs de deux joueurs locaux depuis un seul client.
	 * @param {string} socketId - L'ID du socket du client.
	 * @param {object} movements - Un objet comme { p1: 1, p2: -1 }.
	 */
	handleLocalPlayersInput(socketId, movements) {
		const player1 = this.gameState.activePlayers.find(p => p.id === socketId && p.name === 'player_left_top');
		const player2 = this.gameState.activePlayers.find(p => p.id === socketId && p.name === 'player_right_top');
		
		if (player1) {
			player1.movement = movements.p1;
		}
		if (player2) {
			player2.movement = movements.p2;
		}
	}

	broadcastState() {
		const stateForClient = {
			ball_z: this.gameState.ball.position.z,
			ball_y: this.gameState.ball.position.y,
			players: {},
			score_left: this.gameState.scoreLeft,
			score_right: this.gameState.scoreRight
		};
		this.gameState.activePlayers.forEach(player => {
			// On inclut le pseudo dans les mises a jour pour que le client puisse l'afficher.
			stateForClient.players[player.name] = { y: player.y, pseudo: player.pseudo };
		});
		this.broadcast('game_state_update', stateForClient);
	}

	endGame(winnerPseudo) {
		if (!this.gameState.isGameStarted)
			return;
		clearInterval(this.gameLoop);
		this.gameState.isGameStarted = false;
		const endMessage = winnerPseudo + " Wins!";
		this.broadcast('game_over', { end_message: endMessage });
		console.log(`[Jeu ${this.gameId}] Partie terminee. Vainqueur: ${winnerPseudo}`);
	}

	broadcast(type, data) {
		const message = JSON.stringify({ type, data });
		Object.values(this.sockets).forEach(socket => {
			if (socket.readyState === 1) {
				socket.send(message);
			}
		});
	}
}