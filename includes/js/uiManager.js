// js/uiManager.js

import { resetBall } from './gameLogic.js';

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
	const fpsText = new BABYLON.GUI.TextBlock("fpsText", "");
	fpsText.color = "white";
	fpsText.isHitTestVisible = false;
	fpsText.height = "20%"; // Hauteur relative a l'ecran
	fpsText.left = "-46%"; // Decalage de 20% de la largeur de l'ecran, depuis le centre
	fpsText.top = "-46%";  // Decalage de 15% de la hauteur de l'ecran, depuis le centre
	guiTexture.addControl(fpsText);
	gameState.ui.fpsText = fpsText;

	// Interface pour le score gauche
	const scoreLeftText = new BABYLON.GUI.TextBlock("scoreLeft", "0");
	scoreLeftText.color = "white";
	//fontSize dynamique
	scoreLeftText.height = "20%"; // Hauteur relative a l'ecran
	scoreLeftText.left = "-10%"; // Decalage de 20% de la largeur de l'ecran, depuis le centre
	scoreLeftText.top = "-15%";  // Decalage de 15% de la hauteur de l'ecran, depuis le centre
	scoreLeftText.isHitTestVisible = false;
	scoreLeftText.isVisible = false;
	guiTexture.addControl(scoreLeftText);
	gameState.ui.scoreLeftText = scoreLeftText;

	// Interface pour le score droit
	const scoreRightText = new BABYLON.GUI.TextBlock("scoreRight", "0");
	scoreRightText.color = "white";
	//fontSize dynamique
	scoreRightText.height = "20%";
	scoreRightText.left = "10%"; // Decalage de 20% a droite
	scoreRightText.top = "-15%";
	scoreRightText.isHitTestVisible = false;
	scoreRightText.isVisible = false;
	guiTexture.addControl(scoreRightText);
	gameState.ui.scoreRightText = scoreRightText;

	// Bouton Start
	const startButton = BABYLON.GUI.Button.CreateSimpleButton("startButton", "START");
	startButton.width = "15%"; // 15% de la largeur de l'ecran
	startButton.height = "10%"; // 7% de la hauteur de l'ecran
	startButton.color = "white";
	startButton.background = "green";
    startButton.cornerRadius = 20;
	// On ancre le bouton en bas de l'ecran
	startButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_BOTTOM;
	startButton.paddingBottom = "5%"; // Marge de 5% par rapport au bas
	startButton.top = "-10%";
	guiTexture.addControl(startButton);
	gameState.ui.startButton = startButton;

	// Texte pour annoncer le gagnant
	const winnerText = new BABYLON.GUI.TextBlock("winnerText", "");
	winnerText.color = "gold";
	//fontSize dynamique
	winnerText.top = "10%"; // Decalage de 10% depuis le centre
	winnerText.isVisible = false;
	winnerText.isHitTestVisible = false;
	guiTexture.addControl(winnerText);
	gameState.ui.winnerText = winnerText;

	// Texte pour le compte a rebours
	const countdownText = new BABYLON.GUI.TextBlock("countdownText", "");
	countdownText.color = "white";
	//fontSize dynamique
	countdownText.top = "10%";
	countdownText.isVisible = false;
	countdownText.isHitTestVisible = false;
	guiTexture.addControl(countdownText);
	gameState.ui.countdownText = countdownText;

	// Un texte pour afficher l'etat de pause
	const pauseText = new BABYLON.GUI.TextBlock("pauseText", "PAUSE");
	pauseText.color = "yellow";
	//fontSize dynamique
	pauseText.top = "10%";
	pauseText.isVisible = false;
	pauseText.isHitTestVisible = false;
	guiTexture.addControl(pauseText);
	gameState.ui.pauseText = pauseText;

	//Logique du bouton Start
	startButton.onPointerUpObservable.add(function() {
		gameState.isGameStarted = true;
		startButton.isVisible = false;
		winnerText.isVisible = false;
		scoreRightText.isVisible = true;
		scoreLeftText.isVisible = true;
		gameState.scoreLeft = 0;
		gameState.scoreRight = 0;
		scoreLeftText.text = "0";
		scoreRightText.text = "0";
		resetBall(gameState);
	});

    // --- GESTION DYNAMIQUE DE LA TAILLE DE POLICE ---
    const allTextElements = {
        fps: { element: fpsText, baseSize: 32 },
        score: { element: scoreLeftText, baseSize: 80 },
        scoreRight: { element: scoreRightText, baseSize: 80 },
        winner: { element: winnerText, baseSize: 60 },
        countdown: { element: countdownText, baseSize: 120 },
        pause: { element: pauseText, baseSize: 100 }
    };

    function adaptFontSizes() {
        const referenceHeight = 1080;
        const currentHeight = engine.getRenderHeight();
        const ratio = currentHeight / referenceHeight;

        for (const key in allTextElements) {
            const config = allTextElements[key];
            config.element.fontSize = `${Math.round(config.baseSize * ratio)}px`;
        }
        
        const newButtonFontSize = 24 * ratio;
        startButton.textBlock.fontSize = `${Math.round(newButtonFontSize)}px`;
    }

    adaptFontSizes();
    engine.onResizeObservable.add(adaptFontSizes);

	//#endregion--------------------------------------GUI-jeu----------------------------------------
}