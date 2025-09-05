// js/gameLogic.js

// Les imports sont reduits au strict minimum pour le client.
import { inputMap } from './inputManager.js';
import { debugFps } from './config.js';
import { networkManager } from './networkManager.js';

//region--------------------------------------fonctions-pong------------------------------------

//Fonction pour demarrer le compte a rebours visuel.
export function startCountdown(gameState) {
	let count = 3;
	gameState.ui.countdownText.textBlock.text = count.toString();
	gameState.ui.countdownText.mesh.isVisible = true;

	// La balle reste invisible pendant le decompte.
	if (gameState.ball) {
		gameState.ball.isVisible = false;
	}

	// On s'assure de nettoyer un eventuel intervalle precedent
	if (gameState.countdownInterval) {
		clearInterval(gameState.countdownInterval);
	}

	gameState.countdownInterval = setInterval(() => {
		if (!gameState.isPaused && !gameState.isGamePaused) {
			count--;
			if (count > 0) {
				gameState.ui.countdownText.textBlock.text = count.toString();
			} else {
				// Fin du compte a rebours visuel
				gameState.ui.countdownText.mesh.isVisible = false;
				//affiche la balle
				if (gameState.ball) {
					gameState.ball.isVisible = true;
				}
				clearInterval(gameState.countdownInterval); // On arrete l'intervalle
			}
		}
	}, 1000); // Se declenche toutes les secondes
}

//Fonction pour reinitialiser l'affichage de la balle, suite a un ordre du serveur.
export function resetBall(gameState) {
	// Cette fonction ne fait que lancer le decompte, qui gere lui-meme la visibilite de la balle.
	startCountdown(gameState);
}

//Fonction pour terminer la partie et afficher le message du gagnant.
export function endGame(gameState, message) {
	gameState.isGameStarted = false;
	
	// On s'assure que le compte a rebours est bien arrete
	if (gameState.countdownInterval) {
		clearInterval(gameState.countdownInterval);
	}
	
	gameState.ball.isVisible = false;
	gameState.ui.countdownText.mesh.isVisible = false;
	gameState.ui.winnerText.textBlock.text = message;
	gameState.ui.winnerText.textBlock.fontSize = '35%';
	gameState.ui.winnerText.mesh.isVisible = true;
}

//endregion---------------------------------fin-fonctions-pong----------------------------------

//region------------------------------------input-logique-jeu-----------------------------------

//BOUCLE DE JEU PRINCIPALE
export function startGameLoop(scene, engine, gameState) {
	scene.onBeforeRenderObservable.add(() => {
		// On affiche les FPS
		if (gameState.ui.fpsText && gameState.ui.fpsText.textBlock) {
			gameState.ui.fpsText.textBlock.text = engine.getFps().toFixed() + " fps";
		}

		if (gameState.isGamePaused) {
			return; // On sort immediatement de la boucle de rendu
		}

		// recupere les entrees du ou des joueurs et les envoie au serveur.
		updateAndSendInputs(gameState);

		if (debugFps && gameState.ui.fpsText) {
			gameState.ui.fpsText.mesh.isVisible = true;
        } else if (gameState.ui.fpsText) {
			gameState.ui.fpsText.mesh.isVisible = false;
        }
	});
}

/**
 * Lit les entrees clavier du ou des joueurs locaux, determine leur mouvement (-1, 0, 1),
 * et envoie le(s) message(s) appropries au serveur.
 * @param {object} gameState - L'etat du client.
 */
function updateAndSendInputs(gameState) {
	if (!gameState.isGameStarted)
		return;
	
	// CAS SPECIAL: 2 JOUEURS SUR LE MEME CLAVIER
	if (gameState.gameMode === '2P_LOCAL') {
		const player1 = gameState.activePlayers.find(p => p.config.name === 'player_left_top');
		const player2 = gameState.activePlayers.find(p => p.config.name === 'player_right_top');

		if (!player1 || !player2) {
			return;
		}

		// --- Lecture pour Joueur 1 (w, s) ---
		let upKeysP1;
		if (Array.isArray(player1.config.keys.up)) {
			upKeysP1 = player1.config.keys.up;
		} else {
			upKeysP1 = [player1.config.keys.up];
		}
		const isUpP1 = upKeysP1.some(key => inputMap[key]);
		const isDownP1 = inputMap[player1.config.keys.down];
		let movementP1 = 0;
		if (isUpP1 && !isDownP1) {
			movementP1 = 1;
		}
		if (isDownP1 && !isUpP1) {
			movementP1 = -1;
		}

		// --- Lecture pour Joueur 2 (fleches) ---
		let upKeysP2;
		if (Array.isArray(player2.config.keys.up)) {
			upKeysP2 = player2.config.keys.up;
		} else {
			upKeysP2 = [player2.config.keys.up];
		}
		const isUpP2 = upKeysP2.some(key => inputMap[key]);
		const isDownP2 = inputMap[player2.config.keys.down];
		let movementP2 = 0;
		if (isUpP2 && !isDownP2) {
			movementP2 = 1;
		}
		if (isDownP2 && !isUpP2) {
			movementP2 = -1;
		}

		// On envoie un message seulement si au moins un des mouvements a change.
		if (movementP1 !== player1.lastSentMovement || movementP2 !== player2.lastSentMovement) {
			networkManager.sendMessage('local_players_input', {
				movements: {
					p1: movementP1,
					p2: movementP2
				}
			});
			player1.lastSentMovement = movementP1;
			player2.lastSentMovement = movementP2;
		}

	} else {
		// CAS STANDARD: 1 JOUEUR LOCAL MAXIMUM
		gameState.activePlayers.forEach(player => {
			if (player.controlType !== 'KEYBOARD') {
				return;
			}

			let upKeys;
			if (Array.isArray(player.config.keys.up)) {
				upKeys = player.config.keys.up;
			} else {
				upKeys = [player.config.keys.up];
			}
			let downKeys = player.config.keys.down;

			player.moveUp = upKeys.some(key => inputMap[key]);
			player.moveDown = inputMap[downKeys];

			let movement = 0;
			if (player.moveUp && !player.moveDown) {
				movement = 1; // Mouvement vers le haut
			}
			if (player.moveDown && !player.moveUp) {
				movement = -1; // Mouvement vers le bas
			}

			if (movement !== player.lastSentMovement) {
				networkManager.sendMessage('player_input', { movement: movement });
				player.lastSentMovement = movement;
			}
		});
	}
}

//endregion-------------------------------fin-input-logique-jeu---------------------------------