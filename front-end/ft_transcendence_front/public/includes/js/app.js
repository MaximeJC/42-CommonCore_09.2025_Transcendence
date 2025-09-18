// js/app.js

// --- IMPORTATIONS DES MODULES ---
import { debugVisuals, debug, JwtToken } from './config.js';
import { gameState } from './gameState.js';
import { initializeEngine, createScene } from './sceneSetup.js';
import { 
	createTable, loadArcade, 
	createDebugArrow, createRoom,
	loadArcadeMachines, loadDDM, loadSugarRush, 
	loadHockey, loadWhackAMole, loadBubblegum,
	loadTronArcade, loadPacman 
} from './gameObjects.js';
import { createGUI } from './uiManager.js';
import { setupInputManager } from './inputManager.js';
import { startGameLoop } from './gameLogic.js';
import { networkManager, setAppInitializer } from './networkManager.js';
import { setupPlayers } from './playerManager.js';

// --- VARIABLES GLOBALES POUR LA GESTION DE BABYLON ---
let engine = null;
let activeScene = null;

/**
 * Nettoie la scene de jeu actuelle et retourne au lobby.
 */
function returnToLobby() {
	console.log("Nettoyage de la scene et retour au lobby...");

	// Arreter la boucle de rendu pour eviter les erreurs
	if (engine) {
		engine.stopRenderLoop();
	}

	// S'assurer que le socket est ferme pour ne pas recevoir de messages fantomes
	if (networkManager.socket && networkManager.socket.readyState === WebSocket.OPEN) {
		networkManager.socket.close();
	}

	// Detruire la scene actuelle pour liberer la memoire
	if (activeScene) {
		activeScene.dispose();
		activeScene = null;
	}
	
	// Detruire le moteur pour un nettoyage complet
	if (engine) {
		engine.dispose();
		engine = null;
	}

	// Reinitialiser les parties importantes du gameState
	gameState.isGameStarted = false;
	gameState.activePlayers = [];
	gameState.ball = null;
	// ... (reinitialiser d'autres etats si besoin)
	
	// Reafficher le lobby HTML
	const lobby = document.getElementById('lobby');
	const canvas = document.getElementById('renderCanvas');
	if (lobby)
		lobby.style.display = 'block';
	if (canvas)
		canvas.style.display = 'none';
}

/**
 * Affiche une scene d'attente simple pendant la recherche de partie.
 */
function showWaitingScreen() {
	console.log("Affichage de l'ecran d'attente...");
	
	const waitingScene = new BABYLON.Scene(engine);
	const camera = new BABYLON.FreeCamera("waitingCam", new BABYLON.Vector3(0, 0, -10), waitingScene);
	waitingScene.clearColor = new BABYLON.Color4(0, 0, 0, 1);

	const ui = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI", true, waitingScene);
	const text = new BABYLON.GUI.TextBlock();
	if (gameState.language == 'fr')
		text.text = "Recherche d'une partie...";
	else if (gameState.language == 'es')
		text.text = "Buscando partida...";
	else
		text.text = "Searching for game...";
	text.color = "white";
	// text.fontFamily = "Courier New, monospace";
	text.fontSize = 24;
	ui.addControl(text);

	activeScene = waitingScene;
}

/**
 * Anime la camera de la scene de jeu sur une trajectoire predefinie.
 */
async function playCinematic(scene, camera) {
	console.log("La cinematique demarre...");

	const frameRate = 60;
	const durationInSeconds = 6; // Duree de la cinematique
	const totalFrames = frameRate * durationInSeconds;
	// On definit le moment ou la camera doit passer par le point intermediaire
	const middleFrame = totalFrames / 2;
	const fadeOutDelay = (durationInSeconds - 2) * 1000;

	// LOGIQUE DE LA MODALE "VS" 
	const vsModal = gameState.ui.vsModal;
	if (vsModal && gameState.allPlayersInfo) {
		const playerCount = gameState.allPlayersInfo.length;

		let activeLayout;
		let inactiveLayout;

		if (playerCount <= 2) {
			activeLayout = vsModal.layout1v1;
			inactiveLayout = vsModal.layout2v2;
			vsModal.container.height = "400px";
		} else {
			activeLayout = vsModal.layout2v2;
			inactiveLayout = vsModal.layout1v1;
			vsModal.container.height = "600px";
		}

		// On s'assure que la mauvaise mise en page est cachee et la bonne visible
		inactiveLayout.grid.isVisible = false;
		activeLayout.grid.isVisible = true;
		
		// On parcourt les informations des joueurs recues du serveur
		gameState.allPlayersInfo.forEach(playerInfo => {
			const slot = activeLayout.playerSlots[playerInfo.name];
			const config = gameState.activePlayers.find(p => p.config.name === playerInfo.name)?.config;

			if (slot && config) {
				slot.pseudoText.text = playerInfo.pseudo;
				const colorHex = config.color.toHexString();
				slot.pseudoText.color = colorHex;
				slot.avatarContainer.color = colorHex;
				slot.avatarImage.source = playerInfo.avatarUrl || "includes/img/default_avatar.png";
			}
		});

		// On rend le conteneur principal visible et on lance l'animation de fondu
		vsModal.container.isVisible = true;
		const fadeIn = new BABYLON.Animation("fadeIn", "alpha", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
		fadeIn.setKeys([{ frame: 0, value: 0 }, { frame: 60, value: 1 }]);
		scene.beginDirectAnimation(vsModal.container, [fadeIn], 0, 60, false);
	}

	// Position de depart de la camera
	const startPosition = new BABYLON.Vector3(1530, 25, 250);

	//Position du milieu de la camera
	const middlePosition = new BABYLON.Vector3(750, 25, 250);
	
	// On recupere la position finale desiree de la camera pour etre sur.
	const endPosition = new BABYLON.Vector3(155, 25, 0);
	
	// Cible de depart de la camera
	const startTarget = new BABYLON.Vector3(0, 10, 0);
	// Cible finale de la camera
	const endTarget = new BABYLON.Vector3(0, 10, 0);

	// On place la camera a sa position de depart
	camera.position = startPosition;
	camera.setTarget(startTarget);

	// Creation de l'animation pour la POSITION de la camera
	const positionAnimation = new BABYLON.Animation(
		"cameraPositionAnim", "position", frameRate,
		BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
	);
	positionAnimation.setKeys([
		{ frame: 0, value: startPosition },
		{ frame: middleFrame, value: middlePosition }, // Point de passage
		{ frame: totalFrames, value: endPosition }
	]);

	// Creation de l'animation pour la CIBLE de la camera
	const targetAnimation = new BABYLON.Animation(
		"cameraTargetAnim", "target", frameRate,
		BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
	);
	targetAnimation.setKeys([
		{ frame: 0, value: startTarget },
		{ frame: totalFrames, value: endTarget }
	]);

	// On ajoute une courbe de "liss" a l'animation pour un effet plus doux
	const easingFunction = new BABYLON.QuadraticEase();
	easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);
	positionAnimation.setEasingFunction(easingFunction);
	targetAnimation.setEasingFunction(easingFunction);

	// On attache les animations a la camera
	camera.animations.push(positionAnimation, targetAnimation);
	
	// On desactive les controles manuels pendant la cinematique pour eviter les conflits.
	const canvas = scene.getEngine().getRenderingCanvas();
	camera.detachControl(canvas);

	await scene.beginAnimation(camera, 0, totalFrames, false).waitAsync();

	//  DISPARITION EN FONDU DE LA MODALE 
	if (vsModal) {
		const fadeOut = new BABYLON.Animation("fadeOut", "alpha", 60, BABYLON.Animation.ANIMATIONTYPE_FLOAT, BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT);
		fadeOut.setKeys([
			{ frame: 0, value: 1 },
			{ frame: 60, value: 0 }]);
		await scene.beginDirectAnimation(vsModal.container, [fadeOut], 0, 60, false).waitAsync();
		vsModal.container.isVisible = false;
	}

	// Pour garantir la position finale exacte, on la reaffecte.
	camera.position = endPosition;
	camera.setTarget(endTarget);

	// On reactive les controles manuels a la fin.
	camera.attachControl(canvas, true);
	
	console.log("Cinematique terminee.");
}

/**
 * La fonction principale qui initialise la scene de JEU.
 */
async function initializeApp() {
	console.log("Initialisation de la scene de jeu...");

	// createScene retourne maintenant un objet { scene, camera }
	const { scene: gameScene, camera } = createScene(engine);
	if (debug == true)
	{
		gameScene.debugLayer.show({
			embedMode: true
		});
	}

	// Activation de la decompression Draco 
	BABYLON.DracoCompression.Configuration = {
		decoder: {
			wasmUrl: "https://cdn.babylonjs.com/draco/draco_decoder.js",
			wasmBinaryUrl: "https://cdn.babylonjs.com/draco/draco_decoder.wasm"
		}
	};
		
	// Affichage d'un ecran de chargement
	engine.displayLoadingUI();
	console.time("Temps de chargement total des modeles");

	
	// On cree une liste de toutes les "promesses" de chargement.
	// chargement parallele.
	// On passe 'gameScene' a toutes les fonctions qui chargent des modeles.
	const loadingPromises = [
		 loadArcade(gameScene),
		 loadArcadeMachines(gameScene),
		 loadDDM(gameScene),
		 loadSugarRush(gameScene),
		 loadHockey(gameScene),
		 loadWhackAMole(gameScene),
		 loadBubblegum(gameScene),
		 loadTronArcade(gameScene),
		 loadPacman(gameScene)
	];

	// Promise.all() attend que TOUTES les promesses de la liste soient resolues.
	// Il retourne un tableau avec les resultats dans le meme ordre.
	const [
		 arcade,
		 arcadeMachines,
		 ddm,
		 sugarRush,
		 hockey,
		 whackAMole,
		 bubblegum,
		 tronArcade,
		 pacMan
		] = await Promise.all(loadingPromises);

	console.timeEnd("Temps de chargement total des modeles");

	// cache l'ecran de chargement
	engine.hideLoadingUI();
	await gameScene.whenReadyAsync();

	// On bascule l'affichage sur la scene de jeu pour qu'elle soit visible.
	activeScene = gameScene;

	setupPlayers(gameScene, gameState);

	// On stocke la balle dans gameState comme avant
	const { table, ball } = await createTable(gameScene);
	gameState.ball = ball;
	createRoom(gameScene);

	if (debugVisuals) {
		const debugArrow = createDebugArrow(gameScene);
		debugArrow.parent = gameState.ball;
		debugArrow.isVisible = true;
		gameState.debugArrow = debugArrow;
	}

	// Cree l'interface utilisateur (GUI)
	createGUI(gameState, engine, gameScene, JwtToken);

	// On met l'UI dans son etat initial de jeu.
	gameState.isGameStarted = true;
	if (gameState.ui.statusText)
		gameState.ui.statusText.mesh.isVisible = false;
	if (gameState.ui.winnerText)
		gameState.ui.winnerText.mesh.isVisible = false;
	if (gameState.ui.scoreLeft)
		gameState.ui.scoreLeft.mesh.isVisible = true;
	if (gameState.ui.scoreRight)
		gameState.ui.scoreRight.mesh.isVisible = true;
	if (gameState.ball)
		gameState.ball.isVisible = false;

	// Met en place la gestion des entrees clavier
	setupInputManager(gameScene, gameState);

	// Applique les optimisations finales
	table.material.freeze();
	table.freezeWorldMatrix();

	// optimisations des modeles
	const allLoadedModels = [arcade, tronArcade, pacMan, arcadeMachines, ddm, sugarRush, hockey, whackAMole, bubblegum];
	allLoadedModels.forEach(model => {
		if (model) model.freezeWorldMatrix();
	});

	// On lance la cinematique sur la scene de jeu qui est prete.
	await playCinematic(gameScene, camera);

	// Une fois la cinematique finie, on se declare pret
	networkManager.sendMessage('client_ready', {});
	// startCountdown(gameState);
	
	// La boucle de logique de jeu est lancee en dernier.
	startGameLoop(gameScene, engine, gameState);
}

// On donne la fonction initializeApp au networkManager pour qu'il puisse l'appeler.
setAppInitializer(initializeApp);

// --- POINT D'ENTREE DE L'APPLICATION ---

/**
 * Demarre le processus de matchmaking. C'est la fonction que le client (Vue.js) appellera.
 * @param {object} config - L'objet de configuration du jeu.
 * @param {string} config.pseudo - Le pseudo du joueur.
 * @param {string} config.opponentPseudo - Le pseudo de l'adversaire pour un match prive.
 * @param {string} config.avatarUrl - L'URL de l'avatar.
 * @param {string} config.gameMode - Le mode de jeu selectionne.
 * @param {string} config.language - La langue selectionnee.
 */
async function startMatchmaking(config) {
	const lobby = document.getElementById('lobby');
	const canvas = document.getElementById('renderCanvas');

	// if (!config.pseudo) {
	//	 alert("Configuration error: pseudo is required.");
	//	 return;
	// }

	// MAJ le gameState avec la configuration fournie
	gameState.pseudo = config.pseudo;
	gameState.gameMode = config.gameMode;
	gameState.language = config.language;
	gameState.avatarUrl = config.avatarUrl; // exemple "includes/img/avatar1.jpg";
	gameState.opponentPseudo = config.opponentPseudo;

	// On cache le lobby et on affiche le canvas
	lobby.style.display = 'none';
	canvas.style.display = 'block';

	// On cree le moteur UNE SEULE FOIS.
	if (!engine) {
		engine = initializeEngine();

		// On lance la boucle de rendu principale
		engine.runRenderLoop(() => {
			if (activeScene) {
				activeScene.render();
			}
		});
	}

		// On affiche un simple ecran d'attente.
	showWaitingScreen();

	// On contacte le serveur.
	try {
		await networkManager.connect(JwtToken); // JwtToken a ajouter dans config si besoin aussi
		
		if (config.opponentPseudo && config.gameMode === "1V1_ONLINE") {
			// Si un adversaire est specifie, on cree une partie privee
			console.log(`Demande de partie privee contre ${config.opponentPseudo}`);
			networkManager.sendMessage('create_private_match', {
				my_pseudo: gameState.pseudo,
				opponent_pseudo: config.opponentPseudo,
				mode: gameState.gameMode, // On envoie aussi le mode de jeu
				language: gameState.language,
				avatarUrl: gameState.avatarUrl
			});
		} else {
			// Sinon, on rejoint le matchmaking public
			console.log("Demande de partie publique.");
			networkManager.sendMessage('find_match', {
				mode: gameState.gameMode,
				pseudo: gameState.pseudo,
				language: gameState.language,
				avatarUrl: gameState.avatarUrl
			});
		}

	} catch (error) {
		console.error("Echec de la connexion:", error);
		// En cas d'erreur, on nettoie et on retourne au lobby
		returnToLobby();
		alert("Connection to the server failed. Please try again.");
	}
}

export { startMatchmaking, returnToLobby };