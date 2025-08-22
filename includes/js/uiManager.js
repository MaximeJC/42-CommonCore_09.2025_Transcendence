// js/uiManager.js

import { resetBall } from './gameLogic.js';

//TODO: Rendre responsive

/**
 * Cree toute l'interface utilisateur (GUI) du jeu.
 * @param {object} gameState - L'etat central du jeu.
 */
export function createGUI(gameState) {

	//#region----------------------------------------GUI-jeu-----------------------------------------

	//Creation de l'interface GUI
	const guiTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
	gameState.ui.guiTexture = guiTexture;

	// Interface pour les FPS
	const fpsText = new BABYLON.GUI.TextBlock("fpsText", "");
	fpsText.color = "white";
	fpsText.fontSize = 16;
	fpsText.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
	fpsText.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
	fpsText.paddingTop = "10px";
	fpsText.paddingLeft = "10px";
	guiTexture.addControl(fpsText);
	gameState.ui.fpsText = fpsText;

	// Interface pour le score gauche
	const scoreLeftText = new BABYLON.GUI.TextBlock("scoreLeft");
	scoreLeftText.color = "white";
	scoreLeftText.fontSize = 80;
	scoreLeftText.height = "130px"; // Hauteur fixe pour eviter le "saut" du texte
	scoreLeftText.left = "-130px";
	scoreLeftText.top = "-100px";
	scoreLeftText.isHitTestVisible = false; //empeche le texte de bloquer les clics de souris
	guiTexture.addControl(scoreLeftText);
	gameState.ui.scoreLeftText = scoreLeftText;

	// Interface pour le score droit
	const scoreRightText = new BABYLON.GUI.TextBlock("scoreRight");
	scoreRightText.color = "white";
	scoreRightText.fontSize = 80;
	scoreRightText.height = "130px"; // Hauteur fixe pour eviter le "saut" du texte
	scoreRightText.left = "130px";
	scoreRightText.top = "-100px";
	scoreRightText.isHitTestVisible = false; //empeche le texte de bloquer les clics de souris
	guiTexture.addControl(scoreRightText);
	gameState.ui.scoreRightText = scoreRightText;

	// Bouton Start
	const startButton = BABYLON.GUI.Button.CreateSimpleButton("startButton", "START");
	startButton.width = "150px";
	startButton.height = "40px";
	startButton.color = "white";
	startButton.background = "green";
	startButton.top = "230px";
	guiTexture.addControl(startButton);
	gameState.ui.startButton = startButton;

	// Texte pour annoncer le gagnant
	const winnerText = new BABYLON.GUI.TextBlock("winnerText", "");
	winnerText.fontSize = 60;
	winnerText.color = "gold";
	winnerText.top = "65px";
	winnerText.isVisible = false; // Cache au demarrage
	winnerText.isHitTestVisible = false; //empeche le texte de bloquer les clics de souris
	guiTexture.addControl(winnerText);
	gameState.ui.winnerText = winnerText;

	// Texte pour le compte a rebours
	const countdownText = new BABYLON.GUI.TextBlock("countdownText", "");
	countdownText.fontSize = 120;
	countdownText.color = "white";
	countdownText.top = "95px";
	countdownText.isVisible = false; // Cache au demarrage
	countdownText.isHitTestVisible = false; //empeche le texte de bloquer les clics de souris
	guiTexture.addControl(countdownText);
	gameState.ui.countdownText = countdownText;

	// Un texte pour afficher l'etat de pause
	const pauseText = new BABYLON.GUI.TextBlock("pauseText", "PAUSE");
	pauseText.fontSize = 100;
	pauseText.color = "yellow";
	pauseText.top = "90px";
	pauseText.isVisible = false; // Cache au demarrage
	pauseText.isHitTestVisible = false;
	guiTexture.addControl(pauseText);
	gameState.ui.pauseText = pauseText;

	//Logique du bouton Start
	startButton.onPointerUpObservable.add(function() {
		gameState.isGameStarted = true;
		startButton.isVisible = false;
		winnerText.isVisible = false; // Cache le message du gagnant au demarrage d'une nouvelle partie
		gameState.scoreLeft = 0;
		gameState.scoreRight = 0;
		scoreLeftText.text = "0";
		scoreRightText.text = "0";
		resetBall(gameState);
	});

	//#endregion--------------------------------------GUI-jeu----------------------------------------
}