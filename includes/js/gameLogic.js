// js/gameLogic.js

import { inputMap } from './inputManager.js';
import { initialSpeedBall, maxScore, speedRacket, debugVisuals, speedMultiplicator, iaResponseTime } from './config.js';

//region--------------------------------------fonctions-pong------------------------------------

//Fonction pour demarrer le compte a rebours
export function startCountdown(gameState) {
	let count = 3;
	gameState.ui.countdownText.text = count.toString();
	gameState.ui.countdownText.isVisible = true;

	// On s'assure de nettoyer un eventuel intervalle precedent
	if (gameState.countdownInterval) {
		clearInterval(gameState.countdownInterval);
	}

	gameState.countdownInterval = setInterval(() => {
		if (!gameState.isPaused) {
			count--;
			if (count > 0) {
				gameState.ui.countdownText.text = count.toString();
			} else {
				// Fin du compte a rebours
				gameState.ui.countdownText.isVisible = false;
				gameState.isBallPaused = false; // La balle peut maintenant bouger
				clearInterval(gameState.countdownInterval); // On arrete l'intervalle
			}
		}
	}, 1000); // Se declenche toutes les secondes
}

//Fonction pour reinitialiser la balle
export function resetBall(gameState, directionZ) {
	gameState.isBallPaused = true; // On met la balle en pause
	gameState.ball.position.set(0, 0, 0);
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
	gameState.ballDirection.set(0, yDir, zDir).normalize();

	// --- DEBOGAGE : Reinitialisation du trace ---
	if (debugVisuals) {
		if (gameState.debugTrail) {
			gameState.debugTrail.dispose();
			gameState.debugTrail = null;
		}
		gameState.debugTrailPoints = [];
		// On ajoute le point de depart (le centre)
		gameState.debugTrailPoints.push(new BABYLON.Vector3(0, 0, 0));
	}
	// --- FIN DEBOGAGE ---
		
	startCountdown(gameState); // On lance le compte a rebours au lieu de la balle
}

//Fonction pour terminer la partie
export function endGame(gameState, message) {
	gameState.isGameStarted = false;
	gameState.ball.position.set(0, 0, 0);
		
	// On s'assure que le compte a rebours est bien arrete
	if (gameState.countdownInterval) {
		clearInterval(gameState.countdownInterval);
	}
	gameState.ui.countdownText.isVisible = false;
		
	gameState.ui.winnerText.text = message;
	gameState.ui.winnerText.isVisible = true;
	gameState.ui.startButton.textBlock.text = "RESTART";
	gameState.ui.startButton.isVisible = true;
}

//endregion---------------------------------fin-fonctions-pong----------------------------------

//region------------------------------------input-logique-jeu-----------------------------------

// --- l'IA --- // TODO: implementer la vrai logique 
export function startAIBrain(gameState) {
	const aiPlayer = gameState.activePlayers.find(p => p.controlType === 'AI');
	if (!aiPlayer) {
		return;
	}

	if (gameState.aiUpdateInterval) {
		clearInterval(gameState.aiUpdateInterval);
	}

	gameState.aiUpdateInterval = setInterval(() => {
		// La decision n'est prise que si le jeu est en cours et non en pause
		if (gameState.isGameStarted && gameState.ball && !gameState.isPaused) {
            
            // On verifie si la balle se deplace bien vers le camp de l'IA.
            // Si la position Z de l'IA et la direction Z de la balle ont le meme signe,
            // alors le produit sera positif.
            const isBallComingTowardsAI = (aiPlayer.mesh.position.z * gameState.ballDirection.z) > 0;

            if (isBallComingTowardsAI) {
                // La balle vient vers l'IA : elle calcule sa cible.
                const targetY = gameState.ball.position.y;
                const currentY = aiPlayer.mesh.position.y;
                
                // Zone morte (ou "marge d'erreur") pour que l'IA ne soit pas parfaite
                const errorMargin = 2; 

                if (Math.abs(targetY - currentY) > errorMargin) {
                    aiPlayer.moveUp = targetY > currentY;
                    aiPlayer.moveDown = targetY < currentY;
                } else {
                    // La raquette est deja bien positionnee
                    aiPlayer.moveUp = false;
                    aiPlayer.moveDown = false;
                }

            } else {
                // La balle s'eloigne : l'IA ne bouge pas.
                aiPlayer.moveUp = false;
                aiPlayer.moveDown = false;
            }

		} else {
			// Le jeu est en pause ou termine : l'IA ne bouge pas.
			aiPlayer.moveUp = false;
			aiPlayer.moveDown = false;
		}
	}, iaResponseTime);
		aiPlayer.moveUp = false;
		aiPlayer.moveDown = false;
}
// --- fin IA ---

//BOUCLE DE JEU PRINCIPALE
export function startGameLoop(scene, engine, gameState) {
	scene.onBeforeRenderObservable.add(() => {
		const deltaTime = scene.getEngine().getDeltaTime() / 1000;
		
		gameState.ui.fpsText.text = engine.getFps().toFixed() + " fps";
		

		// On arrete toute la logique de jeu si c'est en pause
		if (gameState.isGamePaused) {
			return; // On sort immediatement de la boucle de rendu
		}

		// MOUVEMENT DES JOUEURS 
		updatePlayers(deltaTime, gameState);

		//LOGIQUE DE LA BALLE ET DES SCORES (si le jeu a commence)
		if (gameState.isGameStarted) {
			if (!gameState.isBallPaused) {
				updateBall(deltaTime, gameState);
			}
		}
	});
}

/**
 * Met a jour les intentions et applique le mouvement pour chaque joueur.
 * @param {number} deltaTime - Le temps ecoule depuis la derniere image.
 * @param {object} gameState - L'etat central du jeu.
 */
function updatePlayers(deltaTime, gameState) {

	 // --- LOGIQUE DE VITESSE PROPORTIONNELLE AJUSTABLE ---
	// 1. On calcule de combien la vitesse de la balle a augmente par rapport au debut.
	const ballSpeedIncrease = gameState.speedBall - initialSpeedBall;

	// 2. On applique notre facteur a cette augmentation.
	const racketSpeedBonus = ballSpeedIncrease * speedMultiplicator;

	// 3. La vitesse finale est la vitesse de base PLUS le bonus calcule.
	const dynamicRacketSpeed = speedRacket + racketSpeedBonus;

	// --- FIN DE LA NOUVELLE LOGIQUE ---
	gameState.activePlayers.forEach(player => {
		// Le switch determine la source de l'input en fonction du type de controleur
		switch (player.controlType) {

			// Si le joueur est controle par le clavier local
			case 'KEYBOARD':
				let upKeys;
				let downKeys;

				if (Array.isArray(player.config.keys.up)) {
					upKeys = player.config.keys.up;
				} else {
					upKeys = [player.config.keys.up];
				}

				if (Array.isArray(player.config.keys.down)) {
					downKeys = player.config.keys.down;
				} else {
					downKeys = [player.config.keys.down];
				}

				player.moveUp = upKeys.some(key => inputMap[key]);
				player.moveDown = downKeys.some(key => inputMap[key]);
				break;

			// Si le joueur est controle par l'Intelligence Artificielle
			// case 'AI':
			// 	if (gameState.isGameStarted && gameState.ball) {
			// 		const targetY = gameState.ball.position.y;
			// 		const currentY = player.mesh.position.y;
					
			// 		if (Math.abs(targetY - currentY) > 2) {
			// 			player.moveUp = targetY > currentY ;
			// 			player.moveDown = targetY < currentY;
			// 		} else {
			// 			player.moveUp = false;
			// 			player.moveDown = false;
			// 		}
			// 	} else {
			// 		player.moveUp = false;
			// 		player.moveDown = false;
			// 	}

			// 	break;

			// Si le joueur est un adversaire en ligne
			case 'ONLINE':
				// TODO: Logique reseau
				// TODO: Mettre a jour player.moveUp et player.moveDown
				// a partir des donnees recues du reseau
				// let receivedData = { up: false, down: false };
				// player.moveUp = receivedData.up;
				// player.moveDown = receivedData.down;
				break;
		}

		// On calcule la direction du mouvement final
		let movement = 0;
		if (player.moveUp) {
			movement = 1; // Mouvement vers le haut
		}
		if (player.moveDown) {
			movement = -1; // Mouvement vers le bas
		}
		// Si les deux sont vrais (improbable), on annule le mouvement
		if (player.moveUp && player.moveDown) {
			movement = 0;
		}

		// On applique le mouvement si necessaire
		if (movement !== 0) {
			player.mesh.position.y += movement * dynamicRacketSpeed * deltaTime;
			player.mesh.position.y = Math.max(gameState.limitDown, Math.min(gameState.limitUp, player.mesh.position.y));
		}
	});
}

function updateBall(deltaTime, gameState) {
	const ball = gameState.ball;

	// --- DEBOGAGE ---
	if (debugVisuals) {
		gameState.debugTrailPoints.push(ball.position.clone());
		if (gameState.debugTrail) {
			gameState.debugTrail.dispose();
		}
		if (gameState.debugTrailPoints.length > 1) {
			gameState.debugTrail = BABYLON.MeshBuilder.CreateLines("debugTrail", {
				points: gameState.debugTrailPoints
			}, ball.getScene());
			gameState.debugTrail.color = new BABYLON.Color3(1, 1, 0); // Jaune
		}
	}
	// --- FIN DEBOGAGE ---
		
	// On calcule le vecteur de deplacement potentiel pour cette frame
	const moveVector = gameState.ballDirection.clone().scale(gameState.speedBall * deltaTime);
	let collisionDetected = false;

	// --- LOGIQUE ANTI-TUNNELING (RAYCASTING) ---
	// On ajoute une petite marge de securite a la longueur du rayon pour compenser le mouvement de la raquette.
	const rayLengthMargin = 3.0; 
	const ray = new BABYLON.Ray(ball.position, gameState.ballDirection, moveVector.length() + rayLengthMargin);

	for (const player of gameState.activePlayers) {
		const pickingInfo = ray.intersectsMesh(player.mesh, false);

		if (pickingInfo.hit) {
			// On ne considere la collision que si la balle se dirige bien VERS le joueur
			const isMovingTowardsPlayer = (player.mesh.position.z > 0 && gameState.ballDirection.z > 0) || (player.mesh.position.z < 0 && gameState.ballDirection.z < 0);
			
			if (isMovingTowardsPlayer) {
				collisionDetected = true;
				ball.position = pickingInfo.pickedPoint; // On deplace la balle au point d'impact
				
				// On applique la logique de rebond
				handleRacketCollision(ball, player, gameState);
				break; 
			}
		}
	}
	// --- FIN DE LA LOGIQUE DE RAYCASTING ---

	// --- COLLISION CLASSIQUE ---
	// Si le raycast n'a rien trouve, on verifie si la balle est deja en contact.
	if (!collisionDetected) {
		for (const player of gameState.activePlayers) {
			if (ball.intersectsMesh(player.mesh, false)) {
				collisionDetected = true;
				// On applique la logique de rebond
				handleRacketCollision(ball, player, gameState);
				break;
			}
		}
	}
	// --- FIN DE LA COLLISION CLASSIQUE ---

	// Si AUCUNE collision n'a ete detectee par les deux methodes, on effectue le deplacement normal.
	if (!collisionDetected) {
		ball.position.addInPlace(moveVector);
	}

	// La logique des murs et des buts est executee APRES que la position finale
	// de la balle pour cette frame a ete determinee.
	const ballRadius = 2;
	const wallLimit = 38;
	if (ball.position.y + ballRadius > wallLimit) {
		ball.position.y = wallLimit - ballRadius;
		gameState.ballDirection.y *= -1;
	} else if (ball.position.y - ballRadius < -wallLimit) {
		ball.position.y = -wallLimit + ballRadius;
		gameState.ballDirection.y *= -1;
	}

	const goalLimit = 40;
	if (ball.position.z > goalLimit) {
		gameState.scoreLeft++;
		gameState.ui.scoreLeftText.text = gameState.scoreLeft.toString();
		
		if (gameState.scoreLeft >= maxScore) {
			const winnerPseudo = gameState.activePlayers[0].config.pseudo;
			endGame(gameState, winnerPseudo + " Wins!");
		} else {
			resetBall(gameState, 1);
		}

	} else if (ball.position.z < -goalLimit) {
		gameState.scoreRight++;
		gameState.ui.scoreRightText.text = gameState.scoreRight.toString();
		
		if (gameState.scoreRight >= maxScore) {
			const winnerPseudo = gameState.activePlayers[1].config.pseudo;
			endGame(gameState, winnerPseudo + " Wins!");
		} else {
			resetBall(gameState, -1);
		}
	}
}

function handleRacketCollision(ball, player, gameState) {
	const diffY = ball.position.y - player.mesh.position.y;
	const hitRatio = diffY / (player.size.y / 2);
	const clampedRatio = Math.max(-1, Math.min(1, hitRatio));

	const maxBounceAngle = Math.PI / 4;
	const bounceAngle = clampedRatio * maxBounceAngle;

	const directionZ = (player.mesh.position.z > 0) ? -1 : 1;
	gameState.ballDirection.y = Math.sin(bounceAngle);
	gameState.ballDirection.z = directionZ * Math.cos(bounceAngle);

	if (gameState.speedBall < 500) {
		gameState.speedBall *= speedMultiplicator;
	}
	ball.position.z += gameState.ballDirection.z * 1.5; // Ejection
}

//endregion-------------------------------fin-input-logique-jeu---------------------------------