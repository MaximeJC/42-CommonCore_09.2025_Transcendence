// pong-server/GameInstance.js

import { v4 as uuidv4 } from 'uuid';
import { createInitialGameState } from './game/gameState.js';
import * as GameLogic from './game/gameLogic.js';
import { limitUp2v2, limitDown2v2, limitUp4v4, limitDown4v4 } from './game/config.js';

const TICK_RATE = 60;

export class GameInstance {
	constructor(clientInfos, gameMode, opponentPseudo = null) { // On recoit des 'infos' { socket, pseudo }
		// --- SUIVI DU TEMPS DE JEU ---
		this.startTime = null; // Le moment ou le jeu commence reellement
		this.gameDurationInSeconds = 0; // La duree totale du jeu
		this.gameId = uuidv4();
		this.sockets = {};
		this.clientInfos = clientInfos;
		this.gameState = createInitialGameState();
		this.gameState.gameMode = gameMode;

		if (gameMode === '4P_ONLINE' || gameMode === '2AI_VS_2AI') {
            this.gameState.limitUp = limitUp4v4;
            this.gameState.limitDown = limitDown4v4;
        } else {
            this.gameState.limitUp = limitUp2v2;
            this.gameState.limitDown = limitDown2v2;
        }

		// On utilise un Set pour stocker les IDs des joueurs qui ont confirme etre prets.
		this.readyPlayers = new Set();

		console.log("[Jeu " + this.gameId + " Creation d'une partie en mode " + gameMode + ".");
		this.setupPlayers(clientInfos, gameMode, opponentPseudo);

		// On ne lance pas le jeu immediatement, on notifie les clients de se preparer.
		this.notifyClientsToPrepare();
	}

	setupPlayers(clientInfos, gameMode, opponentPseudo = null) { // Le parametre est 'clientInfos'
		const players = this.gameState.activePlayers;
		let humanPlayerIndex = 0;
		const { limitUp, limitDown } = this.gameState;
		const midPointY = (limitUp + limitDown) / 2;
		const topY = midPointY + (limitUp - midPointY) / 2;
		const bottomY = midPointY - (midPointY - limitDown) / 2;

		const createPlayer = (defaultPseudo, name, controlType, defaultAvatar, initialY) => {
			let id;
			let pseudo = defaultPseudo; // On garde un pseudo par defaut pour les IA
			let language = 'en';
			let avatarUrl = defaultAvatar || 'includes/img/default_avatar.png';

			// Logique d'assignation d'ID adaptee a tous les cas
			if (controlType.includes('HUMAN')) {
				if (clientInfos[humanPlayerIndex]) {
					const info = clientInfos[humanPlayerIndex];
					id = info.socket.id;
					pseudo = info.pseudo; // On utilise le pseudo fourni par le client
					// On stocke le socket pour pouvoir communiquer avec ce joueur
					language = info.language;
					avatarUrl = info.avatarUrl || 'includes/img/default_avatar.png';
					this.sockets[id] = info.socket;
				} else {
					id = "human_${humanPlayerIndex}";
				}
				humanPlayerIndex++;
			} else {
				id = "AI_${uuidv4()}";
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
				// On s'assure que les deux joueurs partagent le meme ID de socket
				if (players.length === 2) {
					players[1].id = players[0].id;
				}
				break;

			case '1V1_ONLINE':
				players.push(createPlayer("Player 1", 'player_left_top', 'HUMAN', '', 0));
				players.push(createPlayer("Player 2", 'player_right_top', 'HUMAN', '', 0));
				break;

			case '2AI_VS_2AI':
				players.push(createPlayer("Bimo IA", 'player_left_top', 'AI', 'includes/img/lapin.png', topY));
				players.push(createPlayer("Spiderman", 'player_left_bottom',  'includes/img/spiderman.png', '', bottomY));
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
				console.error(`[Jeu ${this.gameId}] Mode de jeu '${gameMode}' inconnu. Creation d'une partie 1v1 par defaut.`);
				players.push(createPlayer("Player 1", 'player_left_top', 'HUMAN', '', 0));
				players.push(createPlayer("Player 2", 'player_right_top', 'HUMAN', '', 0));
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
						all_players: this.gameState.activePlayers.map(p => ({ name: p.name, pseudo: p.pseudo, avatarUrl: p.avatarUrl }))
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
							all_players: this.gameState.activePlayers.map(p => ({ name: p.name, pseudo: p.pseudo, avatarUrl: p.avatarUrl }))
						}
					};
					socket.send(JSON.stringify(message));
				}
			});
		}

		// S'il n'y a aucun joueur humain ET qu'il y a bien un client connecte a cette instance...
		if (humanPlayers.length === 0 && this.clientInfos.length > 0) {
			// ... on recupere le socket du premier client (le spectateur).
			const spectatorSocket = this.clientInfos[0].socket;
			if (spectatorSocket && spectatorSocket.readyState === 1) {
				const message = {
					type: 'game_start',
					data: {
						your_player_name: 'spectator', // On lui dit qu'il est spectateur
						all_players: this.gameState.activePlayers.map(p => ({ name: p.name, pseudo: p.pseudo, avatarUrl: p.avatarUrl }))
					}
				};
				spectatorSocket.send(JSON.stringify(message));
			}
		}
	}

	/**
	 * appelee par le serveur quand un client envoie 'client_ready'.
	 */
	handlePlayerReady(playerId) {
		console.log(`[Jeu ${this.gameId}] Le joueur ${playerId} est pret.`);
		this.readyPlayers.add(playerId);

		const totalClientCount = this.clientInfos.length;

		// On verifie si TOUS les clients connectes a cette partie (joueurs ou spectateurs) sont prets.
		if (this.readyPlayers.size === totalClientCount) {
			console.log(`[Jeu ${this.gameId}] Tous les joueurs/spectateurs sont prets. Lancement du jeu !`);
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

		// On lance le chrono
		this.startTime = Date.now();

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

	async update() {
		if (!this.gameState.isGameStarted)
			return;

		// MISE A JOUR DU CHRONOMETRE
		// On calcule le temps ecoule depuis le debut de la partie.
		if (this.startTime) {
			this.gameDurationInSeconds = Math.floor((Date.now() - this.startTime) / 1000);
		}

		await GameLogic.updateAIMovement(this.gameState);

		const deltaTimeInMs = 1000 / TICK_RATE;
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

		//TODO : Si besoin pour recuperer position balle et joueurs
		// Position et vitesse de la balle
		// const ball = this.gameState.ball;
		// console.log(`Balle: { y: ${ball.position.y.toFixed(2)}, z: ${ball.position.z.toFixed(2)} } | Vitesse: { vy: ${ball.vy.toFixed(2)}, vz: ${ball.vx.toFixed(2)} }`);

		// // Position des joueurs
		// this.gameState.activePlayers.forEach((player, index) => {
		// 	console.log(`Joueur ${index + 1} (${player.pseudo}): { y: ${player.y.toFixed(2)}, movement: ${player.movement} }`);
		// });

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
		if (!this.gameState.isGameStarted) {
			return;
		}
		clearInterval(this.gameLoop);

		// On sauvegarde les scores avant de reinitialiser l'etat
		let score_left = this.gameState.scoreLeft;
		let score_right = this.gameState.scoreRight;
		this.gameState.isGameStarted = false;

		// IDENTIFICATION DU PERDANT
		let loserPseudo = "N/A";
		// On cherche un joueur dont le pseudo n'est PAS celui du gagnant.
		// On s'assure de ne chercher que parmi les joueurs humains si c'est pertinent.
		const loser = this.gameState.activePlayers.find(p => p.pseudo !== winnerPseudo);
		if (loser) {
			loserPseudo = loser.pseudo;
		}

		// MISE A JOUR FINALE DE LA DUREE DU JEU
		// On recalcule une derniere fois pour avoir la valeur la plus precise.
		if (this.startTime) {
			this.gameDurationInSeconds = Math.floor((Date.now() - this.startTime) / 1000);
		}

		// ENVOI DES STATISTIQUES A CHAQUE JOUEUR DANS SA LANGUE
		this.clientInfos.forEach(info => {
			const socket = info.socket;
			if (socket && socket.readyState === 1) {
				let winMessage;
				const lang = info.language || 'en';

				if (lang === 'fr') {
					winMessage = `${winnerPseudo} a gagne !`;
				} else if (lang === 'es') {
					winMessage = `¡${winnerPseudo} ha ganado!`;
				} else {
					winMessage = `${winnerPseudo} Wins!`;
				}

				socket.send(JSON.stringify({
					type: 'game_over',
					data: {
						end_message: winMessage,
						winner: winnerPseudo,
						loser: loserPseudo,
						duration: this.gameDurationInSeconds,
						score_left: score_left,
						score_right: score_right,
						gameMode: this.gameState.gameMode,
						playerLeftTop: this.gameState.activePlayers.find(p => p.name === 'player_left_top').pseudo,
						playerRightTop: this.gameState.activePlayers.find(p => p.name === 'player_right_top').pseudo
					}
				}));
			}
		});

		console.log(`[Jeu ${this.gameId}] Partie terminee. Vainqueur: ${winnerPseudo}`);
		console.log(`[Jeu ${this.gameId}] Partie terminee. Perdant: ${loserPseudo}`);
		console.log(`[Jeu ${this.gameId}] Score final: ${score_left} - ${score_right}`);
		console.log(`[Jeu ${this.gameId}] Duree: ${this.gameDurationInSeconds} secondes.`);
		// TODO : Logique pour enregistrer les scores finaux dans une base de donnees.
	}

	broadcast(type, data) {
		const message = JSON.stringify({ type, data });
		this.clientInfos.forEach(info => {
			const socket = info.socket;
			if (socket && socket.readyState === 1) {
				socket.send(message);
			}
		});
	}
}
