// pong-server/game/gameLogic.js

import {
	initialSpeedBall, maxScore, speedRacket, speedMultiplicator,
	racketHeight1v1, racketHeight2v2,
	wallLimit, goalLimit, iaApiUrl 
} from './config.js';

import fetch from 'node-fetch';



//region--------------------------------------fonctions-pong------------------------------------

/**
 * Fonction pour reinitialiser la balle. Version "pure" sans UI.
 * @param {object} gameState - L'etat de la partie.
 * @param {number} directionZ - La direction de depart (-1 ou 1).
 */
export function resetBall(gameState, directionZ) {
	gameState.isBallPaused = true; // On met la balle en pause
	gameState.ball.position = { y: 0, z: 0 };
	gameState.speedBall = initialSpeedBall;

	let zDir;
	// Si une direction est fournie (apres un but), on l'utilise.
	if (directionZ !== undefined) {
		zDir = directionZ;
	} else {
		// Si le nombre aleatoire est inferieur a 0.5, on va dans une direction.
		if (Math.random() < 0.5) {
			zDir = 1; // Direction vers la droite
		} else {
			// Sinon, on va dans l'autre direction.
			zDir = -1; // Direction vers la gauche
		}
	}

	const yDir = Math.random() * 0.5 - 0.25;

	// Normalisation manuelle pour obtenir un vecteur de direction de longueur 1
	const length = Math.sqrt(yDir * yDir + zDir * zDir);
	gameState.ballDirection = { y: yDir / length, z: zDir / length };

	// On met a jour les composantes de vitesse
	gameState.ball.vx = gameState.ballDirection.z * gameState.speedBall;
	gameState.ball.vy = gameState.ballDirection.y * gameState.speedBall;
}

//Fonction pour terminer la partie (non utilisee directement ici, mais gardee pour la structure)
export function endGame(gameState, message) {
	// La logique de fin de partie (arreter la boucle, etc.) est geree par la GameInstance.
	gameState.isGameStarted = false;
}

//endregion---------------------------------fin-fonctions-pong----------------------------------

//region------------------------------------input-logique-jeu-----------------------------------


/**
 * --- l'IA ---
 * Interroge un serveur d'IA externe pour determiner le mouvement de chaque joueur IA.
 * S'adapte pour que l'IA puisse controler n'importe quelle raquette.
 * @param {object} gameState - L'etat de la partie.
 */
// pong-server/game/gameLogic.js

/**
 * --- l'IA ---
 * Interroge un serveur d'IA externe pour determiner le mouvement de chaque joueur IA.
 * S'adapte pour que l'IA puisse controler n'importe quelle raquette.
 */
export async function updateAIMovement(gameState) {
	const aiPlayers = gameState.activePlayers.filter(p => p.controlType === 'AI');
	if (aiPlayers.length === 0) {
		return;
	}

	for (const aiPlayer of aiPlayers)
	{	
		// Determiner si l'IA est a gauche ou a droite
		const isAiOnLeftSide = aiPlayer.name.includes('left');

		// Trouver l'adversaire le plus proche (pour un etat simplifie)
		let opponent;
		if (isAiOnLeftSide) {
			opponent = gameState.activePlayers.find(p => !p.name.includes('left'));
		} else {
			opponent = gameState.activePlayers.find(p => !p.name.includes('right'));
		}
		
		// Traduire les coordonnees pour l'API de l'IA.
		// L'API de l'IA pense toujours qu'elle controle la raquette de DROITE.
		
		// La position de la balle est inversee si l'IA est a gauche.
		let ballForIA_X;
		if (isAiOnLeftSide) {
			ballForIA_X = -gameState.ball.position.z;
		} else {
			ballForIA_X = gameState.ball.position.z;
		}
		const ballForIA_Y = -gameState.ball.position.y;

		// La vitesse de la balle est inversee si l'IA est a gauche.
		let ballSpeedForIA_X;
		if (isAiOnLeftSide) {
			ballSpeedForIA_X = -gameState.ball.vx;
		} else {
			ballSpeedForIA_X = gameState.ball.vx;
		}
		const ballSpeedForIA_Y = -gameState.ball.vy;

		// La raquette de l'IA est toujours 'right', la raquette de l'adversaire est 'left'.
		const paddleRightForIA = -aiPlayer.y;
		let paddleLeftForIA;
		if (opponent) {
			paddleLeftForIA = -opponent.y;
		} else {
			paddleLeftForIA = 0;
		}

		const stateForIA = {
			ball: {
				x: ballForIA_X,
				y: ballForIA_Y,
				speedX: ballSpeedForIA_X,
				speedY: ballSpeedForIA_Y
			},
			paddles: {
				left: paddleLeftForIA,
				right: paddleRightForIA
			}
		};

		try {
			// Communiquer avec l'API de l'IA
			await fetch(`${iaApiUrl}/update`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(stateForIA)
			});

			const response = await fetch(`${iaApiUrl}/action`);
			const data = await response.json();
			const action = data.action; // "UP", "DOWN", ou "NONE"

			// Traduire la reponse en 'movement' pour notre jeu.
			// La reponse de l'IA ("UP"/"DOWN") est toujours relative a son systeme de coordonnees (Y vers le bas).
			if (action === "UP") {
				aiPlayer.movement = 1; // Monter dans notre systeme (Y vers le haut)
			} else if (action === "DOWN") {
				aiPlayer.movement = -1; // Descendre dans notre systeme
			} else {
				aiPlayer.movement = 0;
			}

		} catch (error) {
			console.error(`[IA Externe] Erreur de communication pour le joueur ${aiPlayer.pseudo}: ${error.message}`);
			aiPlayer.movement = 0;
		}
	}
}
// --- fin IA ---

// /**
//  * --- l'IA ---
//  * Met a jour l'intention de mouvement pour tous les joueurs controles par l'IA.
//  * @param {object} gameState - L'etat de la partie.
//  */
// export function updateAIMovement(gameState) {
// 	// --- On utilise .filter() pour trouver TOUS les joueurs IA ---
// 	const aiPlayers = gameState.activePlayers.filter(p => p.controlType === 'AI');

// 	// S'il n'y a aucune IA dans ce mode de jeu, on ne fait rien.
// 	if (aiPlayers.length === 0) {
// 		return;
// 	}

// 	// On boucle sur chaque joueur IA trouve ---
// 	aiPlayers.forEach(aiPlayer => {
// 		// La decision n'est prise que si le jeu est en cours
// 		if (gameState.isGameStarted && !gameState.isBallPaused) {

// 			let playerZ;
// 			if (aiPlayer.name.includes('left')) {
// 				playerZ = -38;
// 			} else {
// 				playerZ = 38;
// 			}
			
// 			// On verifie si la balle se deplace bien vers le camp de CETTE IA
// 			const isBallComingTowardsAI = (playerZ * gameState.ballDirection.z) > 0;

// 			if (isBallComingTowardsAI) {
// 				// La balle vient vers l'IA : elle calcule sa cible.
// 				const targetY = gameState.ball.position.y;
// 				const currentY = aiPlayer.y;
				
// 				// Zone morte (ou "marge d'erreur") pour que l'IA ne soit pas parfaite
// 				const errorMargin = 2;

// 				if (Math.abs(targetY - currentY) > errorMargin) {
// 					// L'IA decide de monter ou descendre
// 					if (targetY > currentY) {
// 						aiPlayer.movement = 1; // Monter
// 					} else {
// 						aiPlayer.movement = -1; // Descendre
// 					}
// 				} else {
// 					// La raquette est deja bien positionnee
// 					aiPlayer.movement = 0;
// 				}

// 			} else {
// 				// La balle s'eloigne : l'IA ne bouge pas.
// 				aiPlayer.movement = 0;
// 			}

// 		} else {
// 			// Le jeu est en pause ou termine : l'IA ne bouge pas.
// 			aiPlayer.movement = 0;
// 		}
// 	});
// }
// // --- fin IA ---

/**
 * Met a jour la position des joueurs en se basant sur leur intention de mouvement.
 * @param {number} deltaTime - Le temps ecoule depuis le dernier tick de jeu.
 * @param {object} gameState - L'etat central du jeu.
 */
export function updatePlayers(deltaTime, gameState) {
	// On calcule de combien la vitesse de la balle a augmente par rapport au debut.
	const ballSpeedIncrease = gameState.speedBall - initialSpeedBall;
	// On applique notre facteur a cette augmentation.
	const racketSpeedBonus = ballSpeedIncrease * speedMultiplicator;
	// La vitesse finale est la vitesse de base PLUS le bonus calcule.
	const dynamicRacketSpeed = speedRacket + racketSpeedBonus;

	gameState.activePlayers.forEach(player => {
		// Le serveur applique directement la propriete 'movement' (-1, 0, ou 1)
		// qui est mise a jour soit par les messages reseau, soit par l'IA.
		if (player.movement !== 0) {
			player.y += player.movement * dynamicRacketSpeed * deltaTime;
			// On applique les limites physiques du terrain, qui sont stockees dans le gameState
			player.y = Math.max(gameState.limitDown, Math.min(gameState.limitUp, player.y));
		}
	});
}

/**
 * Met a jour la position de la balle et gere toutes les collisions.
 * @param {number} deltaTime - Le temps ecoule.
 * @param {object} gameState - L'etat de la partie.
 * @param {function} onGoal - Callback appelee quand un but est marque.
 * @param {function} onEnd - Callback appelee quand la partie se termine.
 */
export function updateBall(deltaTime, gameState, onGoal, onEnd) {
	if (gameState.isBallPaused) {
		return;
	}

	const ball = gameState.ball;
		
	// On calcule le deplacement potentiel pour cette frame
	ball.position.z += gameState.ballDirection.z * gameState.speedBall * deltaTime;
	ball.position.y += gameState.ballDirection.y * gameState.speedBall * deltaTime;

	// On met a jour les composantes de vitesse a chaque frame
	ball.vx = gameState.ballDirection.z * gameState.speedBall;
	ball.vy = gameState.ballDirection.y * gameState.speedBall;

	// Collision avec les murs haut/bas
	if (ball.position.y > wallLimit || ball.position.y < -wallLimit) {
		ball.position.y = Math.max(-wallLimit, Math.min(wallLimit, ball.position.y));
		gameState.ballDirection.y *= -1;
	}

	// Collision avec les raquettes
	for (const player of gameState.activePlayers) {
		let playerZ;
		if (player.name.includes('left')) {
			playerZ = -38;
		} else {
			playerZ = 38;
		}
		
		let isMovingTowardsPlayer;
		if (playerZ > 0) {
			isMovingTowardsPlayer = gameState.ballDirection.z > 0;
		} else {
			isMovingTowardsPlayer = gameState.ballDirection.z < 0;
		}
		
		let racketHeight;
		if (gameState.activePlayers.length > 2) {
			racketHeight = racketHeight2v2;
		} else {
			racketHeight = racketHeight1v1;
		}
		
		// Condition de collision simple basee sur la proximite
		if (isMovingTowardsPlayer && Math.abs(ball.position.z - playerZ) < 2 && Math.abs(ball.position.y - player.y) < racketHeight / 2) {
			handleRacketCollision(ball, player, gameState);
			// On sort de la boucle des qu'une collision est detectee pour eviter les doubles rebonds
			break;
		}
	}

	// Gestion des buts
	if (ball.position.z > goalLimit) { // But pour l'equipe de gauche
		gameState.scoreLeft++;
		onGoal();
		if (gameState.scoreLeft >= maxScore) {
			let winnerPseudo = "Left Team"; // Nom par defaut
			// En 1v1, il n'y a qu'un joueur a gauche
			if (gameState.activePlayers.length <= 2) {
				const winner = gameState.activePlayers.find(p => p.name.includes('left'));
				if (winner) winnerPseudo = winner.pseudo;
			} else {
				// En 2v2, on peut prendre les deux pseudos
				const winners = gameState.activePlayers.filter(p => p.name.includes('left'));
				if (winners.length > 0) {
					winnerPseudo = `${winners[0].pseudo} & ${winners[1].pseudo}`;
				}
			}
			onEnd(winnerPseudo); // On envoie le pseudo ou le nom de l'equipe
		} else {
			resetBall(gameState, 1);
		}
	} else if (ball.position.z < -goalLimit) { // But pour l'equipe de droite
		gameState.scoreRight++;
		onGoal();
		if (gameState.scoreRight >= maxScore) {
			let winnerPseudo = "Right Team"; // Nom par defaut
			if (gameState.activePlayers.length <= 2) {
				const winner = gameState.activePlayers.find(p => p.name.includes('right'));
				if (winner) winnerPseudo = winner.pseudo;
			} else {
				const winners = gameState.activePlayers.filter(p => p.name.includes('right'));
				if (winners.length > 0) {
					winnerPseudo = `${winners[0].pseudo} & ${winners[1].pseudo}`;
				}
			}
			onEnd(winnerPseudo);
		} else {
			resetBall(gameState, -1);
		}
	}
}

/**
 * Calcule la nouvelle direction de la balle apres un rebond sur une raquette.
 * @param {object} ball - L'objet balle de gameState.
 * @param {object} player - L'objet joueur qui a ete touche.
 * @param {object} gameState - L'etat de la partie.
 */
function handleRacketCollision(ball, player, gameState) {
	let racketHeight;
	if (gameState.activePlayers.length > 2) {
		racketHeight = racketHeight2v2;
	} else {
		racketHeight = racketHeight1v1;
	}

	const diffY = ball.position.y - player.y;
	const hitRatio = diffY / (racketHeight / 2);
	const clampedRatio = Math.max(-1, Math.min(1, hitRatio));

	const maxBounceAngle = Math.PI / 4; // 45 degres
	const bounceAngle = clampedRatio * maxBounceAngle;

	let directionZ;
	if (player.name.includes('right')) {
		directionZ = -1;
	} else {
		directionZ = 1;
	}
		
	gameState.ballDirection.y = Math.sin(bounceAngle);
	gameState.ballDirection.z = directionZ * Math.cos(bounceAngle);

	if (gameState.speedBall < 500) { // Limite de vitesse
		gameState.speedBall *= speedMultiplicator;
	}

	// On met a jour les composantes de vitesse apres le rebond
	gameState.ball.vx = gameState.ballDirection.z * gameState.speedBall;
	gameState.ball.vy = gameState.ballDirection.y * gameState.speedBall;
		
	ball.position.z += gameState.ballDirection.z * 1.5;
}

//endregion-------------------------------fin-input-logique-jeu---------------------------------