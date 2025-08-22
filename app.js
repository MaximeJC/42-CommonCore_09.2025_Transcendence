//#region------------------------------------------config----------------------------------------
const debug = false;

// MODIFIER ICI LE MODE DE JEU
// Options possibles: '1P_VS_AI', '2P_LOCAL', '2P_ONLINE', '4P_ONLINE'
let gameMode = '2P_LOCAL'; 

// Definition des limites possibles pour le terrain
const limitUp2v2 = 24;
const limitDown2v2 = -21;
const limitUp4v4 = 32;
const limitDown4v4 = -28;

let maxScore = 5;

// Variables qui contiendront les limites ACTIVES pour la partie en cours
let limitUp;
let limitDown;

// Vitesses
let speedRacket = 50; 
let speedAI = 35;
let speedBall = 60;

//Variables de jeu
let scoreLeft = 0;
let scoreRight = 0;
let ballDirection = new BABYLON.Vector3(0, 0, 0);
let isGameStarted = false;
let isGamePaused = false;
let isBallPaused = true;
let countdownInterval;

//pour I.A
let aiDecision = { moveUp: false, moveDown: false }; // Stocke la decision de l'IA
let aiUpdateInterval;

//#endregion--------------------------------------fin-config-------------------------------------

//#region---------------------------------scene, lumiere et camera-------------------------------
const canvas = document.getElementById("renderCanvas");
canvas.tabIndex = 1;
canvas.focus();
const engine = new BABYLON.Engine(canvas, true);

const createScene = async function() {
	const scene = new BABYLON.Scene(engine);
		
	const camera = new BABYLON.ArcRotateCamera(
		"Camera",
		BABYLON.Tools.ToRadians(0),
		BABYLON.Tools.ToRadians(80),
		150,
		new BABYLON.Vector3(0, 10, 0),
		scene
	);
		
	const light = new BABYLON.HemisphericLight(
		"light1",
		new BABYLON.Vector3(0, 1, 0),
		scene
	); 
	light.intensity = 0.7;

//#endregion-----------------------------fin-scene, lumiere et camera----------------------------

//#region-----------------------------------ground grille / axes---------------------------------

	if (debug === true) {
		const groundDebug = BABYLON.MeshBuilder.CreateGround("groundDebug", {width: 500, height: 500}, scene);
		const gridMaterial = new BABYLON.GridMaterial("grid", scene);
		gridMaterial.gridRatio = 10;
		gridMaterial.majorUnitFrequency = 5; 
		groundDebug.material = gridMaterial;
		new BABYLON.AxesViewer(scene, 20);
	}

//#endregion-----------------------------fin-ground grille / axes--------------------------------

//#region------------------------------------------decors----------------------------------------


//#endregion-------------------------------------fin-decors--------------------------------------

//#region--------------------------------------fonctions-pong------------------------------------

	function createPlayer(scene, name, color, position, rotation, scaling) {
		const player = BABYLON.MeshBuilder.CreateBox(name, { size: 1 }, scene);
		const material = new BABYLON.StandardMaterial(name + "Mat", scene);
		material.diffuseColor = color;
		player.material = material;
		player.position = position || BABYLON.Vector3.Zero();
		player.rotation = rotation || BABYLON.Vector3.Zero();
		player.scaling = scaling || new BABYLON.Vector3(1, 1, 1);
		
		if (debug) {
			const axes = new BABYLON.AxesViewer(scene, 2);
			axes.xAxis.parent = player;
			axes.yAxis.parent = player;
			axes.zAxis.parent = player;
		}
		return player;
	}

	async function createBall(scene, name, color, position, rotation, scaling, assetName) {
		let ball;
		try {
			if (assetName && assetName.trim() !== "") {
				const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", assetName, scene);
				ball = result.meshes[0];
			} else {
				ball = BABYLON.MeshBuilder.CreateSphere(name, { diameter: 4 }, scene);
				const material = new BABYLON.StandardMaterial(name + "Mat", scene);
				material.diffuseColor = color;
				ball.material = material;
			}
			ball.position = position || BABYLON.Vector3.Zero();
			ball.rotation = rotation || BABYLON.Vector3.Zero();
			ball.scaling = scaling || new BABYLON.Vector3(1, 1, 1);
			
			if (debug){
				const axes = new BABYLON.AxesViewer(scene, 2);
				axes.xAxis.parent = ball;
				axes.yAxis.parent = ball;
				axes.zAxis.parent = ball;
			}
			console.log("Balle importee avec succes !");
		} catch (error) {
			console.error("Erreur lors de l'importation du modele de balle :", error);
		}
		return ball;
	}

		//Fonction pour demarrer le compte a rebours
	function startCountdown() {
		let count = 3;
		countdownText.text = count.toString();
		countdownText.isVisible = true;

		// On s'assure de nettoyer un eventuel intervalle precedent
		if (countdownInterval) {
			clearInterval(countdownInterval);
		}

		countdownInterval = setInterval(() => {
			if (!isGamePaused) {
				count--;
				if (count > 0) {
					countdownText.text = count.toString();
				} else {
					// Fin du compte a rebours
					countdownText.isVisible = false;
					isBallPaused = false; // La balle peut maintenant bouger
					clearInterval(countdownInterval); // On arrete l'intervalle
				}
			}
		}, 1000); // Se declenche toutes les secondes
	}

	//Fonction pour reinitialiser la balle
	function resetBall(directionZ) {
		isBallPaused = true; // On met la balle en pause
		ball.position.set(0, 0, 0);
		speedBall = 60;
		
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
		ballDirection.set(0, yDir, zDir).normalize();
		
		startCountdown(); // On lance le compte a rebours au lieu de la balle
	}

	//Fonction pour terminer la partie
	function endGame(message) {
		isGameStarted = false;
		ball.position.set(0, 0, 0);
		
		// On s'assure que le compte a rebours est bien arrete
		if (countdownInterval) {
			clearInterval(countdownInterval);
		}
		countdownText.isVisible = false;
		
		winnerText.text = message;
		winnerText.isVisible = true;
		startButton.textBlock.text = "RESTART";
		startButton.isVisible = true;
	}

//#endregion---------------------------------fin-fonctions-pong----------------------------------

	const activePlayers = [];

	// Choix des limites du terrain en fonction du mode de jeu
	if (gameMode === '4P_ONLINE') {
		limitUp = limitUp4v4;
		limitDown = limitDown4v4;
	} else {
		limitUp = limitUp2v2;
		limitDown = limitDown2v2;
	}

	// Calculs bases sur les limites actives
	const midPointY = (limitUp + limitDown) / 2;
	const racketSize1v1 = new BABYLON.Vector3(1, 30, 1);
	const racketSize2v2 = new BABYLON.Vector3(1, 15, 1);

// Configurations de base pour tous les emplacements de joueurs possibles
	const allPlayerConfigs = {
		'left_top': {
			name: "player_left_top",
			pseudo: "Player 1",
			color: new BABYLON.Color3(0, 0, 1), // Bleu
			position: new BABYLON.Vector3(0, midPointY + (limitUp - midPointY) / 2, -38),
			keys: {
				up: ['w', 'z'],
				down: 's'
			}
		},
		'left_bottom': {
			name: "player_left_bottom",
			pseudo: "Player 3",
			color: new BABYLON.Color3(0, 1, 1), // Cyan
			position: new BABYLON.Vector3(0, midPointY - (midPointY - limitDown) / 2, -38),
			keys: {
				up: 'r',
				down: 'f'
			}
		},
		'right_top': {
			name: "player_right_top",
			pseudo: "Player 2",
			color: new BABYLON.Color3(1, 0, 0), // Rouge
			position: new BABYLON.Vector3(0, midPointY + (limitUp - midPointY) / 2, 38),
			keys: {
				up: 'arrowup',
				down: 'arrowdown'
			}
		},
		'right_bottom': {
			name: "player_right_bottom",
			pseudo: "Player 4",
			color: new BABYLON.Color3(1, 0.5, 0), // Orange
			position: new BABYLON.Vector3(0, midPointY - (midPointY - limitDown) / 2, 38),
			keys: {
				up: 'i',
				down: 'k'
			}
		}
	};

//#region--------------------------------------creation-objets-----------------------------------

	// Creation des joueurs en fonction du mode de jeu
	switch (gameMode) {
		case '1P_VS_AI':
			activePlayers.push({
				config: {
					pseudo: allPlayerConfigs.left_top.pseudo,
					name: allPlayerConfigs.left_top.name,
					color: allPlayerConfigs.left_top.color,
					keys: allPlayerConfigs.left_top.keys,
					position: new BABYLON.Vector3(0, 0, -38)
				},
				controlType: 'KEYBOARD',
				size: racketSize1v1
			});
			
			activePlayers.push({
				config: {
					pseudo: "Bimo",
					name: allPlayerConfigs.right_top.name,
					color: allPlayerConfigs.right_top.color,
					keys: allPlayerConfigs.right_top.keys,
					position: new BABYLON.Vector3(0, 0, 38)
				},
				controlType: 'AI',
				size: racketSize1v1
			});
			break;

		case '2P_LOCAL':
			activePlayers.push({
				config: {
					pseudo: allPlayerConfigs.left_top.pseudo,
					name: allPlayerConfigs.left_top.name,
					color: allPlayerConfigs.left_top.color,
					keys: allPlayerConfigs.left_top.keys,
					position: new BABYLON.Vector3(0, 0, -38)
				},
				controlType: 'KEYBOARD',
				size: racketSize1v1
			});
			
			activePlayers.push({
				config: {
					pseudo: allPlayerConfigs.right_top.pseudo,
					name: allPlayerConfigs.right_top.name,
					color: allPlayerConfigs.right_top.color,
					keys: allPlayerConfigs.right_top.keys,
					position: new BABYLON.Vector3(0, 0, 38)
				},
				controlType: 'KEYBOARD',
				size: racketSize1v1
			});
			break;
		
		case '1V1_ONLINE':
			console.log("Mode 1V1_ONLINE: En attente d'un adversaire...");
			// Le joueur local est a gauche et controle par le clavier
			activePlayers.push({
				config: {
					pseudo: allPlayerConfigs.left_top.pseudo,
					name: allPlayerConfigs.left_top.name,
					color: allPlayerConfigs.left_top.color,
					keys: allPlayerConfigs.left_top.keys,
					position: new BABYLON.Vector3(0, 0, -38)
				},
				controlType: 'KEYBOARD',
				size: racketSize1v1
			});
			
			// L'adversaire est a droite et controle par le reseau
			activePlayers.push({
				config: {
					pseudo: allPlayerConfigs.right_top.pseudo,
					name: allPlayerConfigs.right_top.name,
					color: allPlayerConfigs.right_top.color,
					keys: allPlayerConfigs.right_top.keys,
					position: new BABYLON.Vector3(0, 0, 38)
				},
				controlType: 'ONLINE',
				size: racketSize1v1
			});
			break;
			
		case '4P_ONLINE':
			console.warn("Mode 4P_ONLINE: Seul le joueur en haut a gauche (bleu) est controlable localement.");
			activePlayers.push({
				config: allPlayerConfigs.left_top,
				controlType: 'KEYBOARD',
				size: racketSize2v2
			});
			activePlayers.push({
				config: allPlayerConfigs.left_bottom,
				controlType: 'ONLINE',
				size: racketSize2v2 }); 
			activePlayers.push({
				config: allPlayerConfigs.right_top,
				controlType: 'ONLINE',
				size: racketSize2v2
			});
			activePlayers.push({
				config: allPlayerConfigs.right_bottom,
				controlType: 'ONLINE',
				size: racketSize2v2
			});
			break;
	}

	// Boucle de creation des mesh 3D pour chaque joueur actif
	activePlayers.forEach(playerData => {
		playerData.mesh = createPlayer(
			scene,
			playerData.config.name,
			playerData.config.color,
			playerData.config.position,
			BABYLON.Vector3.Zero(),
			playerData.size
		);
		playerData.moveUp = false;
		playerData.moveDown = false;
	});

const ball = await createBall( // Declare une constante 'ball' et attend la fin de la creation de la balle
		scene, // La scene dans laquelle la balle sera creee
		"ball", // Le nom unique (ID) du mesh de la balle
		new BABYLON.Color3(1, 1, 1), // La couleur de la balle (blanc)
		new BABYLON.Vector3(0, 0, 0), // La position initiale de la balle (au centre du monde)
		new BABYLON.Vector3(0, 0, 0), // La rotation initiale de la balle (aucune rotation)
		new BABYLON.Vector3(1, 1, 1) // L'echelle initiale de la balle (taille normale)
	);

	const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 80, height: 80 }, scene);
	const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
	groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
	groundMaterial.alpha = 0.50;
	ground.material = groundMaterial;
	ground.position = new BABYLON.Vector3(-1, 0, 0);
	ground.rotation = new BABYLON.Vector3(0, Math.PI, Math.PI / 2);

	try {
		const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./assets/", "pong_arcade.glb", scene);
		const pong_arcade = result.meshes[0];
		pong_arcade.position = new BABYLON.Vector3(50, -35, 65.5);
		pong_arcade.scaling.scaleInPlace(0.2);
		
		if (debug) {
			const axesArcade = new BABYLON.AxesViewer(scene, 2);
			axesArcade.xAxis.parent = pong_arcade;
			axesArcade.yAxis.parent = pong_arcade;
			axesArcade.zAxis.parent = pong_arcade;
		}
		console.log("Arcade importee avec succes !");
		pong_arcade.freezeWorldMatrix(); 
		pong_arcade.getChildMeshes().forEach(mesh => {
			if(mesh.material){
				mesh.material.freeze();
			}
		});
	} 
	catch (error) {
		console.error("Erreur lors de l'importation du modele d'arcade :", error);
	}

//#endregion---------------------------------fin-creation-objets---------------------------------

//#region--------------------------------------optimisations-------------------------------------
	// activePlayers.forEach(p => p.mesh.material.freeze());
	ground.material.freeze();
	ground.freezeWorldMatrix();
//#endregion---------------------------------fin-optimisations-----------------------------------

//#region----------------------------------------GUI-jeu-----------------------------------------

	//Creation de l'interface GUI
	const guiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

	// Interface pour les FPS
	const fpsText = new BABYLON.GUI.TextBlock("fpsText", "");
	fpsText.color = "white";
	fpsText.fontSize = 16;
	fpsText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
	fpsText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
	fpsText.paddingTop = "10px";
	fpsText.paddingLeft = "10px";
	guiTexture.addControl(fpsText);

	// Interface pour le score gauche
	const scoreLeftText = new BABYLON.GUI.TextBlock("scoreLeft");
	scoreLeftText.color = "white";
	scoreLeftText.fontSize = 80;
	scoreLeftText.height = "130px"; // Hauteur fixe pour eviter le "saut" du texte
	scoreLeftText.left = "-130px";
	scoreLeftText.top = "-100px";
	scoreLeftText.isHitTestVisible = false; //empeche le texte de bloquer les clics de souris
	guiTexture.addControl(scoreLeftText);

	// Interface pour le score droit
	const scoreRightText = new BABYLON.GUI.TextBlock("scoreRight");
	scoreRightText.color = "white";
	scoreRightText.fontSize = 80;
	scoreRightText.height = "130px"; // Hauteur fixe pour eviter le "saut" du texte
	scoreRightText.left = "130px";
	scoreRightText.top = "-100px";
	scoreRightText.isHitTestVisible = false; //empeche le texte de bloquer les clics de souris
	guiTexture.addControl(scoreRightText);

	// Bouton Start
	const startButton = BABYLON.GUI.Button.CreateSimpleButton("startButton", "START");
	startButton.width = "150px";
	startButton.height = "40px";
	startButton.color = "white";
	startButton.background = "green";
	startButton.top = "230px";
	guiTexture.addControl(startButton);

	// Texte pour annoncer le gagnant
	const winnerText = new BABYLON.GUI.TextBlock("winnerText", "");
	winnerText.fontSize = 60;
	winnerText.color = "gold";
	winnerText.top = "65px";
	winnerText.isVisible = false; // Cache au demarrage
	winnerText.isHitTestVisible = false; //empeche le texte de bloquer les clics de souris
	guiTexture.addControl(winnerText);

	// Texte pour le compte a rebours
	const countdownText = new BABYLON.GUI.TextBlock("countdownText", "");
	countdownText.fontSize = 120;
	countdownText.color = "white";
	countdownText.top = "95px";
	countdownText.isVisible = false; // Cache au demarrage
	countdownText.isHitTestVisible = false; //empeche le texte de bloquer les clics de souris
	guiTexture.addControl(countdownText);

	// Un texte pour afficher l'etat de pause
	const pauseText = new BABYLON.GUI.TextBlock("pauseText", "PAUSE");
	pauseText.fontSize = 100;
	pauseText.color = "yellow";
	pauseText.top = "90px";
	pauseText.isVisible = false; // Cache au demarrage
	pauseText.isHitTestVisible = false;
	guiTexture.addControl(pauseText);

	//Logique du bouton Start
	startButton.onPointerUpObservable.add(function() {
		isGameStarted = true;
		startButton.isVisible = false;
		winnerText.isVisible = false; // Cache le message du gagnant au demarrage d'une nouvelle partie
		scoreLeft = 0;
		scoreRight = 0;
		scoreLeftText.text = "0";
		scoreRightText.text = "0";
		resetBall();
	});

//#endregion--------------------------------------GUI-jeu----------------------------------------

//#region------------------------------------input-logique-jeu-----------------------------------

	// --- l'IA ---
	// Cette fonction configure la boucle de reflexion de l'IA.
	// A MODIFIER AVEC NOTRE VRAI LOGIQUE IA POUR TRANSCENDENCE
	function startAIBrain() {
		// On cherche le joueur controle par l'IA
		const aiPlayer = activePlayers.find(p => p.controlType === 'AI');
		// S'il n'y a pas d'IA dans ce mode de jeu, on ne fait rien.
		if (!aiPlayer) {
			return;
		}

		// On s'assure de nettoyer un eventuel timer precedent
		if (aiUpdateInterval) {
			clearInterval(aiUpdateInterval);
		}

		// On lance le timer de reflexion de l'IA (une fois par seconde)
		aiUpdateInterval = setInterval(() => {
			// L'IA ne reflechit que si la partie a commence
			if (isGameStarted && ball) {
				// L'IA "regarde" le jeu
				const targetY = ball.position.y;
				const currentY = aiPlayer.mesh.position.y;

				// L'IA prend une decision
				if (Math.abs(targetY - currentY) > 2) {
					aiDecision.moveUp = targetY > currentY;
					aiDecision.moveDown = targetY < currentY;
				} else {
					aiDecision.moveUp = false;
					aiDecision.moveDown = false;
				}

				// Logique pour les power-ups (a implementer)
				// if (aiPlayer.hasPowerUp && shouldUsePowerUp()) {
				//	aiDecision.usePowerUp = true; 
				// }
			} else {
				// Si le jeu est en pause, l'IA decide de ne rien faire.
				aiDecision.moveUp = false;
				aiDecision.moveDown = false;
			}
		}, 1000); // 1000 ms = 1 seconde
	}

	// On demarre le cerveau de l'IA juste apres la creation des joueurs
	startAIBrain();
	// --- fin IA ---

	//Gestion du clavier
	const inputMap = {};
	scene.actionManager = new BABYLON.ActionManager(scene);
	scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
		BABYLON.ActionManager.OnKeyDownTrigger, function(evt) {
			const key = evt.sourceEvent.key.toLowerCase();
			// Logique de la pause
			if (key === 'escape' && isGameStarted && (gameMode === '1P_VS_AI' || gameMode === '2P_LOCAL')) {
				isGamePaused = !isGamePaused; // On inverse l'etat de pause
				pauseText.isVisible = isGamePaused; // On affiche ou cache le texte
				countdownText.isVisible = !isGamePaused;
			}
			
			inputMap[key] = true;
		}
	));

	scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
		BABYLON.ActionManager.OnKeyUpTrigger, function(evt) {
			inputMap[evt.sourceEvent.key.toLowerCase()] = false;
		}
	));

	//BOUCLE DE JEU PRINCIPALE
	scene.onBeforeRenderObservable.add(() => {
		const deltaTime = scene.getEngine().getDeltaTime() / 1000;
		
		fpsText.text = engine.getFps().toFixed() + " fps";

		// On arrete toute la logique de jeu si c'est en pause
		if (isGamePaused) {
			return; // On sort immediatement de la boucle de rendu
		}

		// MOUVEMENT DES JOUEURS 
		activePlayers.forEach(player => {
			
			// Le switch determine la source de l'input en fonction du type de controleur
			switch (player.controlType) {

				// Si le joueur est controle par le clavier local
				case 'KEYBOARD':
					// On declare les variables qui contiendront les touches a verifier
					let upKeys;
					let downKeys;

					// On s'assure que 'upKeys' est toujours un tableau
					// pour pouvoir utiliser la methode .some() plus tard.
					if (Array.isArray(player.config.keys.up)) {
						// Si la config est deja un tableau (ex: ['w', 'z']), on l'utilise
						upKeys = player.config.keys.up;
					} else {
						// Sinon (c'est une chaine), on le met dans un tableau (ex: ['arrowup'])
						upKeys = [player.config.keys.up];
					}

					// On fait la meme chose pour les touches "bas"
					if (Array.isArray(player.config.keys.down)) {
						downKeys = player.config.keys.down;
					} else {
						downKeys = [player.config.keys.down];
					}

					// On verifie si au moins une des touches "haut" est actuellement pressee
					player.moveUp = upKeys.some(key => inputMap[key]);
					// On verifie si au moins une des touches "bas" est actuellement pressee
					player.moveDown = downKeys.some(key => inputMap[key]);
					break;

				// Si le joueur est controle par l'Intelligence Artificielle
				case 'AI': // a revoir avec notre IA avec vue par secondes
					// L'IA ne joue que si la partie a commence et que la balle existe
					if (isGameStarted && ball) {
						// On recupere les positions verticales de la balle et de la raquette de l'IA
						const targetY = ball.position.y;
						const currentY = player.mesh.position.y;

						// On cree une "zone morte" pour eviter que l'IA ne tremble sur place
						if (Math.abs(targetY - currentY) > 2) {
							// L'intention de l'IA est de monter si la balle est plus haute
							player.moveUp = targetY > currentY;
							// L'intention de l'IA est de descendre si la balle est plus basse
							player.moveDown = targetY < currentY;
						} else {
							// Si la balle est alignee, l'IA ne bouge pas
							player.moveUp = false;
							player.moveDown = false;
						}
					} else {
						// Si la partie n'a pas commence, l'IA ne bouge pas
						player.moveUp = false;
						player.moveDown = false;
					}
					break;

				// Si le joueur est un adversaire en ligne
				case 'ONLINE':
					// Admettons que 'receivedData' est l'objet recu du reseau pour ce joueur
					// Par exemple : receivedData = { up: true, down: false };
					
					// On met a jour les intentions du joueur en ligne
					// a partir des donnees recues
					player.moveUp = receivedData.up;
					player.moveDown = receivedData.down;
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
				// On deplace la raquette en fonction de la vitesse et du temps ecoule (deltaTime)
				player.mesh.position.y += movement * speedRacket * deltaTime;
				// On s'assure que la raquette ne depasse pas les limites du terrain
				player.mesh.position.y = Math.max(limitDown, Math.min(limitUp, player.mesh.position.y));
			}
		});

		//LOGIQUE DE LA BALLE ET DES SCORES (si le jeu a commence)
		if (isGameStarted) {
			if (!isBallPaused) {
				// Deplacement
				ball.position.addInPlace(ballDirection.scale(speedBall * deltaTime));

				// Collision murs haut/bas
				const ballRadius = 2; // Diametre de 4 / 2
				if (ball.position.y + ballRadius >= 38 || ball.position.y - ballRadius <= -38) {
					ballDirection.y *= -1;
				}

				// Detection des buts
				const goalLimit = 40;
				if (ball.position.z > goalLimit) {
					scoreLeft++;
					scoreLeftText.text = scoreLeft.toString();
					
					//Verification de la condition de victoire
					if (scoreLeft >= maxScore) {
						const winnerPseudo = activePlayers[0].config.pseudo;
						endGame(winnerPseudo + " Wins!"); // Appelle la fonction de fin de partie
					} else {
						resetBall(1); // Continue la partie
					}

				} else if (ball.position.z < -goalLimit) {
					scoreRight++;
					scoreRightText.text = scoreRight.toString();
					
					//Verification de la condition de victoire
					if (scoreRight >= maxScore) {
						const winnerPseudo = activePlayers[1].config.pseudo;
						endGame(winnerPseudo + " Wins!"); // Appelle la fonction de fin de partie
					} else {
						resetBall(-1); // Continue la partie
					}
				}

				// Collision avec les raquettes
				for (const player of activePlayers) {
					if (ball.intersectsMesh(player.mesh, false)) {
						ballDirection.z *= -1;
						const diffY = ball.position.y - player.mesh.position.y;
						ballDirection.y += diffY / (player.size.y / 2) * 0.5;
						ballDirection.normalize();
						speedBall *= 1.05;
						ball.position.z += ballDirection.z * 1.5;
						break;
					}
				}
			}
		}
	});

//#endregion-------------------------------fin-input-logique-jeu---------------------------------

return scene;
};

//Point d'entree principal
createScene().then(sceneToRender => {
	engine.runRenderLoop(function() { 
		if (sceneToRender) {
			sceneToRender.render();
		}
	});
});

window.addEventListener("resize", function () {
	engine.resize();
});