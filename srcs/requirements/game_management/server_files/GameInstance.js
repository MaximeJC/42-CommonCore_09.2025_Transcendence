import { v4 as uuidv4 } from 'uuid';
import { createInitialGameState } from './game/gameState.js';
import * as GameLogic from './game/gameLogic.js';
import { limitUp2v2, limitDown2v2, limitUp4v4, limitDown4v4 } from './game/config.js';

const TICK_RATE = 60;

export class GameInstance {
	constructor(clientInfos, gameMode, opponentPseudo = null) {
		this.startTime = null;
		this.gameDurationInSeconds = 0;
		this.gameId = uuidv4();
		this.clientInfos = clientInfos;
		this.gameState = createInitialGameState();
		this.gameState.gameMode = gameMode;
		this.gameState.status = 'waiting_for_ready';

		if (gameMode === '4P_ONLINE' || gameMode === '2AI_VS_2AI') {
			this.gameState.limitUp = limitUp4v4;
			this.gameState.limitDown = limitDown4v4;
		} else {
			this.gameState.limitUp = limitUp2v2;
			this.gameState.limitDown = limitDown2v2;
		}

		this.readyPlayers = new Set();

		console.log(`[Jeu ${this.gameId}] Creation d'une partie en mode ${gameMode}.`);
		this.setupPlayers(clientInfos, gameMode, opponentPseudo);
	}

	setupPlayers(clientInfos, gameMode, opponentPseudo = null) {
		const players = this.gameState.activePlayers;
		let humanPlayerIndex = 0;
		const { limitUp, limitDown } = this.gameState;
		const midPointY = (limitUp + limitDown) / 2;
		const topY = midPointY + (limitUp - midPointY) / 2;
		const bottomY = midPointY - (midPointY - limitDown) / 2;

		const createPlayer = (defaultPseudo, name, controlType, defaultAvatar, initialY) => {
			let id, pseudo = defaultPseudo, language = 'en', avatarUrl = defaultAvatar || 'includes/img/default_avatar.png';

			if (controlType.includes('HUMAN')) {
				if (clientInfos[humanPlayerIndex]) {
					const info = clientInfos[humanPlayerIndex];
					id = info.id;
					pseudo = info.pseudo;
					language = info.language;
					avatarUrl = info.avatarUrl || 'includes/img/default_avatar.png';
				} else {
					id = `human_${humanPlayerIndex}`;
				}
				humanPlayerIndex++;
			} else {
				id = `AI_${uuidv4()}`;
			}
			return { id, pseudo, name, y: initialY, movement: 0, controlType, language, avatarUrl };
		};

		switch (gameMode) {
			case 'AI_VS_AI':
				players.push(createPlayer("Bimo IA", 'player_left_top', 'AI', 'includes/img/lapin.png', 0));
				players.push(createPlayer("Hecate", 'player_right_top', 'AI', 'includes/img/chat.png', 0));
				break;
			case '1P_VS_AI':
				players.push(createPlayer("Player 1", 'player_left_top', 'HUMAN', '', 0));
				players.push(createPlayer("Bimo IA", 'player_right_top', 'AI', 'includes/img/lapin.png', 0));
				break;
			case '2P_LOCAL':
				const player2Pseudo = opponentPseudo || "Player 2";
				players.push(createPlayer("Player 1", 'player_left_top', 'HUMAN_LOCAL', '', 0));
				players.push(createPlayer(player2Pseudo, 'player_right_top', 'HUMAN_LOCAL', '', 0));
				if (players.length === 2) players[1].id = players[0].id;
				break;
			case '1V1_ONLINE':
				players.push(createPlayer("Player 1", 'player_left_top', 'HUMAN', '', 0));
				players.push(createPlayer("Player 2", 'player_right_top', 'HUMAN', '', 0));
				break;
			case '2AI_VS_2AI':
				players.push(createPlayer("Bimo IA", 'player_left_top', 'AI', 'includes/img/lapin.png', topY));
				players.push(createPlayer("Spiderman", 'player_left_bottom',  'AI', 'includes/img/spiderman.png', bottomY));
				players.push(createPlayer("Hecate", 'player_right_top', 'AI', 'includes/img/chat.png', topY));
				players.push(createPlayer("Roger", 'player_right_bottom', 'AI',  'includes/img/roger.png', bottomY));
				break;
			case '4P_ONLINE':
				players.push(createPlayer("Player 1", 'player_left_top', 'HUMAN', '', topY));
				players.push(createPlayer("Player 2", 'player_left_bottom', 'HUMAN', '', bottomY));
				players.push(createPlayer("Player 3", 'player_right_top', 'HUMAN', '', topY));
				players.push(createPlayer("Player 4", 'player_right_bottom', 'HUMAN', '', bottomY));
				break;
			default:
				players.push(createPlayer("Player 1", 'player_left_top', 'HUMAN', '', 0));
				players.push(createPlayer("Player 2", 'player_right_top', 'HUMAN', '', 0));
				break;
		}
	}

	getSerializableState() {
		const playersState = {};
		this.gameState.activePlayers.forEach(p => {
			playersState[p.name] = { y: p.y, pseudo: p.pseudo, id: p.id, avatarUrl: p.avatarUrl };
		});

		return {
			gameId: this.gameId,
			status: this.gameState.status,
			mode: this.gameState.gameMode,
			ball_z: this.gameState.ball.position.z,
			ball_y: this.gameState.ball.position.y,
			players: playersState,
			all_players: this.gameState.activePlayers.map(p => ({ name: p.name, pseudo: p.pseudo, avatarUrl: p.avatarUrl })), // Infos statiques
			score_left: this.gameState.scoreLeft,
			score_right: this.gameState.scoreRight,
			countdownEndTime: this.gameState.countdownEndTime || null,
			duration: this.gameDurationInSeconds,

			end_message: this.gameState.endMessage || null,
			winner: this.gameState.winnerPseudo || null,
			loser: this.gameState.loserPseudo || null,
		};
	}

	handlePlayerReady(playerId) {
		console.log(`[Jeu ${this.gameId}] Le joueur ${playerId} est pret.`);
		this.readyPlayers.add(playerId);

		const humanOrSpectatorCount = this.gameState.activePlayers.filter(p => p.controlType.includes('HUMAN')).length || this.clientInfos.length;

		if (this.readyPlayers.size >= humanOrSpectatorCount) {
			console.log(`[Jeu ${this.gameId}] Tous les joueurs/spectateurs sont prets. Lancement du jeu !`);
			this.beginGame();
		}
	}

	beginGame() {
		this.gameState.isGameStarted = true;
		this.gameState.status = 'countdown';
		this.gameState.countdownEndTime = Date.now() + 3000;

		this.startTime = Date.now();
		GameLogic.resetBall(this.gameState, Math.random() < 0.5 ? 1 : -1);

		setTimeout(() => {
			this.gameState.isBallPaused = false;
			this.gameState.status = 'playing';
		}, 3000);

		this.gameLoop = setInterval(() => {
			this.update();
		}, 1000 / TICK_RATE);
	}

	async update() {
		if (!this.gameState.isGameStarted) return;

		if (this.startTime) {
			this.gameDurationInSeconds = Math.floor((Date.now() - this.startTime) / 1000);
		}

		await GameLogic.updateAIMovement(this.gameState);

		const deltaTimeInSeconds = (1000 / TICK_RATE) / 1000;
		GameLogic.updatePlayers(deltaTimeInSeconds, this.gameState);
		GameLogic.updateBall(deltaTimeInSeconds, this.gameState,
			() => {
				this.gameState.isBallPaused = true;
				setTimeout(() => { this.gameState.isBallPaused = false; }, 3000);
			},
			(winnerPseudo) => {
				const loser = this.gameState.activePlayers.find(p => p.pseudo !== winnerPseudo);
				const endMessage = `${winnerPseudo} Wins!`;
				this.endGame({ winner: winnerPseudo, loser: loser?.pseudo, endMessage });
			}
		);
	}

	handlePlayerInput(playerId, movement) {
		const player = this.gameState.activePlayers.find(p => p.id === playerId);
		if (player && player.controlType === 'HUMAN') {
			player.movement = movement;
		}
	}

	handleLocalPlayersInput(socketId, movements) {
		const player1 = this.gameState.activePlayers.find(p => p.id === socketId && p.name === 'player_left_top');
		const player2 = this.gameState.activePlayers.find(p => p.id === socketId && p.name === 'player_right_top');
		if (player1) player1.movement = movements.p1;
		if (player2) player2.movement = movements.p2;
	}

	endGame(finalData) {
		if (!this.gameState.isGameStarted) return;
		
		clearInterval(this.gameLoop);
		this.gameState.isGameStarted = false;
		this.gameState.status = 'finished';

		if (this.startTime) {
			this.gameDurationInSeconds = Math.floor((Date.now() - this.startTime) / 1000);
		}

		this.gameState.endMessage = finalData.endMessage;
		this.gameState.winnerPseudo = finalData.winner;
		this.gameState.loserPseudo = finalData.loser || "N/A";

		console.log(`[Jeu ${this.gameId}] Partie terminee. Vainqueur: ${this.gameState.winnerPseudo}`);
		console.log(`[Jeu ${this.gameId}] Score final: ${this.gameState.scoreLeft} - ${this.gameState.scoreRight}`);
		console.log(`[Jeu ${this.gameId}] Duree: ${this.gameDurationInSeconds} secondes.`);
	}
}