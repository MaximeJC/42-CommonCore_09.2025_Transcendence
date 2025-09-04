// js/uiManager.js

import { resetBall } from './gameLogic.js';
import { create3DButton, createTextBox } from './gameObjects.js';
// import { scene } from './sceneSetup.js';

import { networkManager } from './networkManager.js';

/**
 * Cree toute l'interface utilisateur (GUI) du jeu de maniere responsive.
 * @param {object} gameState - L'etat central du jeu.
 * @param {BABYLON.Engine} engine - Le moteur de rendu de Babylon.
 */
export function createGUI(gameState, engine, scene, JwtToken) {

	//#region----------------------------------------GUI-jeu-----------------------------------------

	//Creation de l'interface GUI
	const guiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
	gameState.ui.guiTexture = guiTexture;

	// --- ELEMENTS DU GUI POSITIONNES AVEC ANCRAGE ET POURCENTAGES ---

	// Interface pour les FPS
	const fpsText = createTextBox("fpsText", "", scene);
	fpsText.textBlock.background = "transparent";
	fpsText.textBlock.color = "white";
	fpsText.textBlock.thickness = 0;
	fpsText.textBlock.isReadOnly = true;
	fpsText.textBlock.isHitTestVisible = false;
	fpsText.textBlock.fontSize = '20%';
	fpsText.textBlock.text = "0";
	fpsText.mesh.position.set(0, 35, -31);
	fpsText.mesh.rotation.y = -Math.PI / 2;
	gameState.ui.fpsText = fpsText;

	// Interface pour le score gauche
	const scoreLeft = createTextBox("scoreLeft", "", scene);
	scoreLeft.textBlock.background = "transparent";
	scoreLeft.textBlock.color = "white";
	scoreLeft.textBlock.thickness = 0;
	scoreLeft.textBlock.isReadOnly = true;
	scoreLeft.textBlock.isHitTestVisible = false;
	scoreLeft.textBlock.fontSize = '100%';
	scoreLeft.textBlock.text = "0";
	scoreLeft.mesh.position.set(-8, 30, -20);
	scoreLeft.mesh.rotation.y = -Math.PI / 2;
	scoreLeft.mesh.isVisible = false;
	gameState.ui.scoreLeft = scoreLeft;

	// Interface pour le score droit
	const scoreRight = createTextBox("scoreRight", "", scene);
	scoreRight.textBlock.background = "transparent";
	scoreRight.textBlock.color = "white";
	scoreRight.textBlock.thickness = 0;
	scoreRight.textBlock.isReadOnly = true;
	scoreRight.textBlock.isHitTestVisible = false;
	scoreRight.textBlock.fontSize = '100%';
	scoreRight.textBlock.text = "0";
	scoreRight.mesh.position.set(-8, 30, 20);
	scoreRight.mesh.rotation.y = -Math.PI / 2;
	scoreRight.mesh.isVisible = false;
	gameState.ui.scoreRight = scoreRight;

	const startButton = create3DButton("startBtn", "START", scene);
	startButton.mesh.position.set(8, -30, 0);
	startButton.mesh.rotation.x = -0.1;
	startButton.mesh.rotation.y = -Math.PI / 2;
	gameState.ui.startButton = startButton;

	// Elements de statut et de victoire (pas de changement ici)
	const statusText = createTextBox("statusText", "", { meshWidth: 60, meshHeight: 15, textureWidth: 2048, textureHeight: 512 }, scene);
	statusText.textBlock.background = "transparent";
	statusText.textBlock.color = "white";
	statusText.textBlock.thickness = 0;
	statusText.textBlock.fontSize = '60%';
	statusText.mesh.position.set(0, 0, 0);
	statusText.mesh.rotation.y = -Math.PI / 2;
	statusText.mesh.isVisible = false;
	gameState.ui.statusText = statusText;

	const winnerText = createTextBox("winnerText", "", { meshWidth: 60, meshHeight: 15, textureWidth: 2048, textureHeight: 512 }, scene);
	winnerText.textBlock.background = "transparent";
	winnerText.textBlock.color = "gold";
	winnerText.textBlock.thickness = 0;
	winnerText.textBlock.fontSize = '60%';
	winnerText.mesh.position.set(0, 0, 0);
	winnerText.mesh.rotation.y = -Math.PI / 2;
	winnerText.mesh.isVisible = false;
	gameState.ui.winnerText = winnerText;
	
	const countdownText = createTextBox("countdownText", "", scene);
	countdownText.textBlock.background = "transparent";
	countdownText.textBlock.color = "white";
	countdownText.textBlock.thickness = 0;
	countdownText.textBlock.isReadOnly = true;
	countdownText.textBlock.isHitTestVisible = false;
	countdownText.textBlock.fontSize = '100%';
	countdownText.textBlock.text = "0";
	countdownText.mesh.position.set(0, 0, 0);
	countdownText.mesh.rotation.y = -Math.PI / 2;
	countdownText.mesh.isVisible = false;
	gameState.ui.countdownText = countdownText;

	const pauseText = createTextBox("pauseText", "", scene);
	pauseText.textBlock.background = "transparent";
	pauseText.textBlock.color = "yellow";
	pauseText.textBlock.thickness = 0;
	pauseText.textBlock.isReadOnly = true;
	pauseText.textBlock.isHitTestVisible = false;
	pauseText.textBlock.fontSize = '100%';
	pauseText.textBlock.text = "PAUSE";
	pauseText.mesh.position.set(0, 0, 0);
	pauseText.mesh.rotation.y = -Math.PI / 2;
	pauseText.mesh.isVisible = false;
	gameState.ui.pauseText = pauseText;

	/**
	 * Encapsule la logique de connexion et de recherche de partie.
	 * Cette fonction pourra etre appelee depuis n'importe ou, pas seulement par le bouton.
	 */
	async function startGame() {
		try {
			// Afficher le statut de connexion a l'utilisateur
			statusText.textBlock.text = "CONNECTING...";
			statusText.textBlock.fontSize = '50%';
			statusText.textBlock.color = "white";
			statusText.mesh.isVisible = true;
			winnerText.mesh.isVisible = false;
			console.log("CONNECTING...");

			// Connexion au serveur
			await networkManager.connect(JwtToken, scene);
			
			// Afficher le statut de recherche
			statusText.textBlock.text = "SEARCHING...";
			console.log(`Envoi de la demande de match pour le mode: ${gameState.gameMode}`);

			// Envoyer la demande de match au serveur
			networkManager.sendMessage('find_match', { mode: gameState.gameMode });
				
			// On cache le bouton pour eviter les clics multiples pendant la recherche.
			startButton.mesh.isVisible = false;

		} catch (error) {
			// En cas d'echec de la connexion
			statusText.textBlock.text = "ERROR";
			statusText.textBlock.fontSize = '60%';
			statusText.textBlock.color = "RED";
			statusText.mesh.isVisible = true;
			console.error("Echec de la connexion:", error);
			// On s'assure que le bouton est a nouveau visible pour que l'utilisateur puisse reessayer.
			startButton.mesh.isVisible = true;
		}
	}

	startButton.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
		BABYLON.ActionManager.OnPickTrigger,
		function () {
			console.log("Le bouton start a ete clique !");
			// Le bouton ne fait plus qu'appeler notre nouvelle fonction de demarrage.
			startGame();
		}
	));

	//#endregion--------------------------------------GUI-jeu----------------------------------------
}