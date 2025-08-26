// js/uiManager.js

import { resetBall } from './gameLogic.js';
import { create3DButton, createTextBox } from './gameObjects.js';
import { scene } from './sceneSetup.js';

/**
 * Cree toute l'interface utilisateur (GUI) du jeu de maniere responsive.
 * @param {object} gameState - L'etat central du jeu.
 * @param {BABYLON.Engine} engine - Le moteur de rendu de Babylon.
 */
export function createGUI(gameState, engine) {

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
	fpsText.textBlock.text = "0"; // Mettre le texte initial
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
	scoreLeft.textBlock.text = "0"; // Mettre le texte initial
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
	// On positionne le bouton dans le monde 3D
	startButton.mesh.position.set(7, -48, 0);
	startButton.mesh.rotation.x = -0.1;
	startButton.mesh.rotation.y = -Math.PI / 2;
	gameState.ui.startButton = startButton;

	// On definit ce qui se passe quand on clique sur le bouton 3D
	startButton.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
		BABYLON.ActionManager.OnPickTrigger, // OnPickTrigger = Clic
		function () {
			console.log("Le bouton start a ete clique !");
			gameState.isGameStarted = true;
			startButton.mesh.isVisible = false;
			winnerText.isVisible = false;
			gameState.ui.scoreRight.mesh.isVisible = true;
			gameState.ui.scoreLeft.mesh.isVisible = true;
			gameState.scoreLeft = 0;
			gameState.scoreRight = 0;
			gameState.ui.scoreLeft.textBlock.text = "0";
			gameState.ui.scoreRight.textBlock.text = "0";
			gameState.ui.winnerText.mesh.isVisible = false;
			resetBall(gameState);

		}
	));

	const winnerText = createTextBox("winnerText", "", {
		meshWidth: 60,
		meshHeight: 15,
		textureWidth: 2048,
		textureHeight: 512
	}, scene);
	winnerText.textBlock.background = "transparent";
	winnerText.textBlock.color = "gold";
	winnerText.textBlock.thickness = 0;
	winnerText.textBlock.isReadOnly = true;
	winnerText.textBlock.isHitTestVisible = false;
	winnerText.textBlock.fontSize = '60%';
	winnerText.textBlock.text = ""; // Mettre le texte initial
	winnerText.mesh.position.set(0, 0, 0);
	winnerText.mesh.rotation.y = -Math.PI / 2;
	winnerText.mesh.isVisible = false;
	gameState.ui.winnerText = winnerText;

	// Texte pour le compte a rebours
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

	// Un texte pour afficher l'etat de pause
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


	//#endregion--------------------------------------GUI-jeu----------------------------------------
}