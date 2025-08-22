// js/app.js

// --- IMPORTATIONS DES MODULES ---
import { gameMode } from './config.js';
import { debugVisuals } from './config.js'; 
import { gameState } from './gameState.js';
import { initializeEngine, createScene } from './sceneSetup.js';
import { createBall, createTable, loadArcade, createDebugArrow } from './gameObjects.js';
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

	// Definit les joueurs actifs en fonction du mode de jeu
	setupPlayers(scene, gameState);

	// Cree les objets 3D restants (balle, table, etc.)
	// On stocke la reference de la balle dans l'etat du jeu
	gameState.ball = await createBall(scene); 
	const table = createTable(scene);
	const arcade = await loadArcade(scene);

	if (debugVisuals) {
		gameState.debugArrow = createDebugArrow(scene);
		gameState.debugArrow.parent = gameState.ball;
		gameState.debugArrow.isVisible = true;
	}

	// Cree l'interface utilisateur (GUI)
	createGUI(gameState, engine);

	// Met en place la gestion des entrees clavier
	setupInputManager(scene, gameState);

	// Demarre le "cerveau" de l'IA si necessaire
	if (gameMode === '1P_VS_AI') {
		startAIBrain(gameState);
	}

	// Applique les optimisations finales
	table.material.freeze();
	table.freezeWorldMatrix();

	// 8. Lance la boucle de logique de jeu
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