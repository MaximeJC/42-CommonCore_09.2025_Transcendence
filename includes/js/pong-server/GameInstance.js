// pong-server/GameInstance.js

import { v4 as uuidv4 } from 'uuid';
import { createInitialGameState } from './game/gameState.js';
import * as GameLogic from './game/gameLogic.js';
import { limitUp2v2, limitDown2v2, limitUp4v4, limitDown4v4, iaResponseTime } from './game/config.js';

const TICK_RATE = 60;

export class GameInstance {
	constructor(clientSockets, gameMode) {
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
		
		console.log(`[Jeu ${this.gameId}] Creation d'une partie en mode ${gameMode}.`);
		this.setupPlayers(clientSockets, gameMode);

		this.startGame();
	}

	setupPlayers(clientSockets, gameMode) {
		const players = this.gameState.activePlayers;
		let humanPlayerIndex = 0;

		const createPlayer = (pseudo, name, controlType) => {
			let id;
			// Logique d'assignation d'ID adaptee a tous les cas
			if (controlType === 'HUMAN') {
				if (clientSockets[humanPlayerIndex]) {
					id = clientSockets[humanPlayerIndex].id;
					// On stocke le socket pour pouvoir communiquer avec ce joueur
					this.sockets[id] = clientSockets[humanPlayerIndex];
				} else {
					id = `human_${humanPlayerIndex}`;
				}
				humanPlayerIndex++;
			} else if (controlType === 'HUMAN_LOCAL') {
				// Pour 2P_LOCAL, les deux joueurs sont lies au meme socket.
				id = clientSockets[0].id;
				// On s'assure de n'ajouter le socket qu'une seule fois
				if (!this.sockets[id]) {
					this.sockets[id] = clientSockets[0];
				}
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
				break;

			case '2P_ONLINE':
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

	startGame() {
		this.gameState.isGameStarted = true;
		this.broadcast('game_start', { opponent_pseudo: "Adversaire(s)" });

		let initialDirection;
		if (Math.random() < 0.5) { initialDirection = 1; } else { initialDirection = -1; }
		GameLogic.resetBall(this.gameState, initialDirection);
		
		setTimeout(() => { this.gameState.isBallPaused = false; }, 3000);
		this.gameLoop = setInterval(() => { this.update(); }, 1000 / TICK_RATE);
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
	 * NOUVELLE FONCTION pour gerer les inputs de deux joueurs locaux depuis un seul client.
	 * @param {string} socketId - L'ID du socket du client.
	 * @param {object} movements - Un objet comme { p1: 1, p2: -1 }.
	 */
	handleLocalPlayersInput(socketId, movements) {
		// Le joueur 1 est le premier joueur de type HUMAN_LOCAL lie a ce socketId.
		const player1 = this.gameState.activePlayers.find(p => p.id === socketId && p.controlType === 'HUMAN_LOCAL' && p.name === 'player_left_top');
		// Le joueur 2 est le second.
		const player2 = this.gameState.activePlayers.find(p => p.id === socketId && p.controlType === 'HUMAN_LOCAL' && p.name === 'player_right_top');
		
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
			stateForClient.players[player.name] = { y: player.y };
		});
		this.broadcast('game_state_update', stateForClient);
	}

	endGame(winnerPseudo) {
		if (!this.gameState.isGameStarted) return;
		clearInterval(this.gameLoop);
		this.gameState.isGameStarted = false;
		this.broadcast('game_over', { winner_pseudo: winnerPseudo });
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