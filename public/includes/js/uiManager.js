// js/uiManager.js

// import { resetBall } from './gameLogic.js';
import { create3DButton, createTextBox } from './gameObjects.js';
import { returnToLobby } from './app.js';
// import { scene } from './sceneSetup.js';

// import { networkManager } from './networkManager.js';

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

	// Elements de statut et de victoire
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

	// const pauseText = createTextBox("pauseText", "", scene);
	// pauseText.textBlock.background = "transparent";
	// pauseText.textBlock.color = "yellow";
	// pauseText.textBlock.thickness = 0;
	// pauseText.textBlock.isReadOnly = true;
	// pauseText.textBlock.isHitTestVisible = false;
	// pauseText.textBlock.fontSize = '100%';
	// if (gameState.language === 'fr')
	// 	pauseText.textBlock.text = "PAUSE";
	// else if (gameState.language === 'es')
	// 	pauseText.textBlock.text = "PAUSA";
	// else
	// 	pauseText.textBlock.text = "PAUSE";
	// pauseText.mesh.position.set(0, 0, 0);
	// pauseText.mesh.rotation.y = -Math.PI / 2;
	// pauseText.mesh.isVisible = false;
	// gameState.ui.pauseText = pauseText;

	// /**
	//  * Encapsule la logique de connexion et de recherche de partie.
	//  * Cette fonction pourra etre appelee depuis n'importe ou, pas seulement par le bouton.
	//  */
	// async function startGame() {
	// 	try {
	// 		// Afficher le statut de connexion a l'utilisateur
	// 		statusText.textBlock.text = "CONNECTING...";
	// 		statusText.textBlock.fontSize = '50%';
	// 		statusText.textBlock.color = "white";
	// 		statusText.mesh.isVisible = true;
	// 		winnerText.mesh.isVisible = false;
	// 		console.log("CONNECTING...");

	// 		// Connexion au serveur
	// 		await networkManager.connect(JwtToken, scene);
			
	// 		// Afficher le statut de recherche
	// 		statusText.textBlock.text = "SEARCHING...";
	// 		console.log("Envoi de la demande de match pour le mode: ${gameState.gameMode}");

	// 		// Envoyer la demande de match au serveur
	// 		networkManager.sendMessage('find_match', { mode: gameState.gameMode });
				
	// 		// On cache le bouton pour eviter les clics multiples pendant la recherche.
	// 		startButton.mesh.isVisible = false;

	// 	} catch (error) {
	// 		// En cas d'echec de la connexion
	// 		statusText.textBlock.text = "ERROR";
	// 		statusText.textBlock.fontSize = '60%';
	// 		statusText.textBlock.color = "RED";
	// 		statusText.mesh.isVisible = true;
	// 		console.error("Echec de la connexion:", error);
	// 		// On s'assure que le bouton est a nouveau visible pour que l'utilisateur puisse reessayer.
	// 		startButton.mesh.isVisible = true;
	// 	}
	// }

	const returnButton = create3DButton("returnBtn", "MENU", scene);
	returnButton.mesh.position.set(8, -30, 0);
	returnButton.mesh.rotation.x = -0.1;
	returnButton.mesh.rotation.y = -Math.PI / 2;
	returnButton.mesh.isVisible = false; // Important: il est cache au debut
	gameState.ui.returnButton = returnButton;

	const exitButton = BABYLON.GUI.Button.CreateSimpleButton("exitBtn", "X");
	exitButton.width = "40px";
	exitButton.height = "40px";
	exitButton.color = "white";
	exitButton.fontSize = '3%';
	exitButton.background = "rgba(200, 50, 50, 0.8)"; // Un fond rouge semi-transparent
	exitButton.cornerRadius = 5;
	exitButton.thickness = 1; // Bordure
	// exitButton.fontFamily = "Courier New, monospace";
	
	// Positionnement en haut a droite de l'ecran
	exitButton.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
	exitButton.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
	exitButton.left = "-20px"; // Marge par rapport a la droite
	exitButton.top = "20px";   // Marge par rapport au haut
	
	// Action du bouton: appeler la fonction de retour au lobby
	exitButton.onPointerUpObservable.add(() => {
		console.log("Le bouton 'Quitter' a ete clique.");
		returnToLobby();
	});

	// On l'ajoute a l'interface
	guiTexture.addControl(exitButton);
	// On le sauvegarde dans le gameState pour pouvoir le manipuler plus tard
	gameState.ui.exitButton = exitButton;
	// 

	// On attache une action simple au clic sur ce bouton: recharger la page.
	returnButton.mesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
		BABYLON.ActionManager.OnPickTrigger,
		function () {
			console.log("Retour au menu principal...");
			returnToLobby();
		}
	));


	//#endregion--------------------------------------GUI-jeu----------------------------------------
}