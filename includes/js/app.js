// js/app.js

// --- IMPORTATIONS DES MODULES ---
import { gameMode, debugVisuals, debug, JwtToken } from './config.js';
import { gameState } from './gameState.js';
import { initializeEngine, createScene } from './sceneSetup.js';
import { createBall, createTable, loadArcade, 
	createDebugArrow, createRoom,
	loadArcadeMachines, loadDDM, loadSugarRush, 
	loadHockey, loadWhackAMole, loadBubblegum,
	loadTronArcade, loadPacman } from './gameObjects.js';
import { setupPlayers } from './playerManager.js';
import { createGUI } from './uiManager.js';
import { setupInputManager } from './inputManager.js';
import { startGameLoop, startAIBrain } from './gameLogic.js';

/**
 * La fonction principale asynchrone qui initialise et demarre le jeu.
 */
async function initializeApp() {
	// Initialise le moteur et la scene de base
	const engine = initializeEngine();
	
	const scene = createScene(engine);
	if (debug == true)
	{
		scene.debugLayer.show({
			embedMode: true
		});
	}

	// --- CHARGEMENT PARALLELE DES MODELES ---
	console.time("Temps de chargement total des modeles");

	// On cree une liste de toutes les "promesses" de chargement.
	// Chaque appel a une fonction async retourne une promesse.
	const loadingPromises = [
		 loadArcade(scene),
		 loadArcadeMachines(scene),
		 loadDDM(scene),
		 loadSugarRush(scene),
		 loadHockey(scene),
		 loadWhackAMole(scene),
		 loadBubblegum(scene),
		 loadTronArcade(scene),
		 loadPacman(scene)
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

	// Definit les joueurs actifs en fonction du mode de jeu
	setupPlayers(scene, gameState);

	const { table, ball } = await createTable(scene);

	// On stocke la balle dans gameState comme avant
	gameState.ball = ball;

	const room = createRoom(scene);

	if (debugVisuals) {
		gameState.debugArrow = createDebugArrow(scene);
		gameState.debugArrow.parent = gameState.ball;
		gameState.debugArrow.isVisible = true;
	}

	// Cree l'interface utilisateur (GUI)
	createGUI(gameState, engine, scene, JwtToken);

	// Met en place la gestion des entrees clavier
	setupInputManager(scene, gameState);

	// Demarre le "cerveau" de l'IA si necessaire
	// Options possibles: AI_VS_AI, '1P_VS_AI', '2P_LOCAL', '2P_ONLINE', '4P_ONLINE',

	if (gameMode == '1P_VS_AI' || gameMode == 'AI_VS_AI' || gameMode == '2AI_VS_2AI') {
		startAIBrain(gameState);
	}

	// Applique les optimisations finales
	table.material.freeze();
	table.freezeWorldMatrix();

	// Lance la boucle de logique de jeu
	startGameLoop(scene, engine, gameState);

	// Lance la boucle de rendu
	engine.runRenderLoop(function() { 
		if (scene) {
			scene.render();
		}
	});
}

// Point d'entree principal : on lance l'application
initializeApp();