// js/uiManager.js

import { create3DButton, createTextBox } from './gameObjects.js';
import { returnToLobby } from './app.js';
import * as BABYLON from '@babylonjs/core';
import * as GUI from '@babylonjs/gui';


function createVSModal(guiTexture, gameState) {

	// Conteneur principal (le fond)
	const vsContainer = new GUI.Rectangle("vsContainer");
	vsContainer.width = "55%";
	vsContainer.adaptHeightToChildren = true;
	vsContainer.cornerRadius = 20;
	vsContainer.color = "#e251ca";
	vsContainer.thickness = 4;
	vsContainer.background = "rgba(10, 10, 20, 0.85)";
	vsContainer.paddingTop = "20px";
	vsContainer.paddingBottom = "20px";
	
	vsContainer.alpha = 0;
	vsContainer.isVisible = false;
	guiTexture.addControl(vsContainer);

	// FONCTION D'AIDE POUR CREER UN PANNEAU JOUEUR (AVATAR + PSEUDO) 
	const createPlayerPanel = (name) => {
		const panel = new GUI.StackPanel(name + "_panel");
		panel.isVertical = true;

		const avatarContainer = new GUI.Ellipse(name + "_avatar_container");
		avatarContainer.width = "120px";
		avatarContainer.height = "120px";
		avatarContainer.thickness = 0;
		avatarContainer.color = "white";
		panel.addControl(avatarContainer);

		const avatarImage = new GUI.Image(name + "_avatar_img", "includes/img/default_avatar.png");
		avatarContainer.addControl(avatarImage);

		const pseudoText = new GUI.TextBlock(name + "_pseudo", "");
		pseudoText.color = "white";
		pseudoText.fontSize = 40;
		pseudoText.fontWeight = "bold";
		pseudoText.paddingTop = "20px";
		pseudoText.height = "80px";
		panel.addControl(pseudoText);

		return { panel, avatarContainer, avatarImage, pseudoText };
	};

	// ==========================================================
	//  MISE EN PAGE 1 : GRILLE POUR LE 1v1
	// ==========================================================
	const grid1v1 = new GUI.Grid("vsGrid1v1");
	grid1v1.addRowDefinition(1.0); // Une seule ligne pour un centrage vertical parfait
	grid1v1.addColumnDefinition(0.45);
	grid1v1.addColumnDefinition(0.20);
	grid1v1.addColumnDefinition(0.45);
	vsContainer.addControl(grid1v1);
	grid1v1.isVisible = false; // Cachee par defaut

	const p1 = createPlayerPanel("vsP_1v1_L");
	const p2 = createPlayerPanel("vsP_1v1_R");
	const vsText1v1 = new GUI.TextBlock("vsText1v1", "VS");
	vsText1v1.color = "#e251ca";
	vsText1v1.fontSize = 40;
	vsText1v1.fontWeight = "bold";

	grid1v1.addControl(p1.panel, 0, 0);
	grid1v1.addControl(vsText1v1, 0, 1);
	grid1v1.addControl(p2.panel, 0, 2);

	// ==========================================================
	//  MISE EN PAGE 2 : GRILLE POUR LE 2v2 (HAUT/BAS)
	// ==========================================================
	const grid2v2 = new GUI.Grid("vsGrid2v2");
	// On revient a une grille a 3 lignes pour un placement simple et fiable
	grid2v2.addRowDefinition(0.45); // Ligne du haut
	grid2v2.addRowDefinition(0.10); // Ligne du milieu pour le VS
	grid2v2.addRowDefinition(0.45); // Ligne du bas
	grid2v2.addColumnDefinition(0.45);
	grid2v2.addColumnDefinition(0.20);
	grid2v2.addColumnDefinition(0.45);
	vsContainer.addControl(grid2v2);
	grid2v2.isVisible = false; // Cachee par defaut

	const p_lt = createPlayerPanel("vsP_2v2_LT");
	const p_lb = createPlayerPanel("vsP_2v2_LB");
	const p_rt = createPlayerPanel("vsP_2v2_RT");
	const p_rb = createPlayerPanel("vsP_2v2_RB");
	const vsText2v2 = new GUI.TextBlock("vsText2v2", "VS");
	vsText2v2.color = "#e251ca";
	vsText2v2.fontSize = 40;
	vsText2v2.fontWeight = "bold";

	// On place chaque element dans sa cellule designee, comme dans votre code original.
	grid2v2.addControl(p_lt.panel, 0, 0);
	grid2v2.addControl(p_lb.panel, 2, 0); // Ligne 2 pour le joueur du bas
	grid2v2.addControl(vsText2v2, 1, 1); // Le "VS" va dans la ligne du milieu
	grid2v2.addControl(p_rt.panel, 0, 2);
	grid2v2.addControl(p_rb.panel, 2, 2); // Ligne 2 pour le joueur du bas
	
	// On stocke les references aux DEUX mises en page
	gameState.ui.vsModal = {
		container: vsContainer,
		layout1v1: {
			grid: grid1v1,
			playerSlots: {
				player_left_top: p1,
				player_right_top: p2
			}
		},
		layout2v2: {
			grid: grid2v2,
			playerSlots: {
				player_left_top: p_lt,
				player_left_bottom: p_lb,
				player_right_top: p_rt,
				player_right_bottom: p_rb,
			}
		}
	};
}

/**
 * Cree toute l'interface utilisateur (GUI) du jeu de maniere responsive.
 * @param {object} gameState - L'etat central du jeu.
 * @param {BABYLON.Engine} engine - Le moteur de rendu de Babylon.
 */
export function createGUI(gameState, engine, scene, JwtToken) {

	//#region----------------------------------------GUI-jeu-----------------------------------------

	//Creation de l'interface GUI
	const guiTexture = GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
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

	const exitButton = GUI.Button.CreateSimpleButton("exitBtn", "X");
	exitButton.width = "40px";
	exitButton.height = "40px";
	exitButton.color = "white";
	exitButton.fontSize = '3%';
	exitButton.background = "rgba(200, 50, 50, 0.8)"; // Un fond rouge semi-transparent
	exitButton.cornerRadius = 5;
	exitButton.thickness = 1; // Bordure
	// exitButton.fontFamily = "Courier New, monospace";
	
	// Positionnement en haut a droite de l'ecran
	exitButton.horizontalAlignment = GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
	exitButton.verticalAlignment = GUI.Control.VERTICAL_ALIGNMENT_TOP;
	exitButton.left = "-20px"; // Marge par rapport a la droite
	exitButton.top = "20px";   // Marge par rapport au haut
	
	// Action du bouton: appeler la fonction de retour au lobby
	exitButton.onPointerUpObservable.add(() => {
		console.log("Le bouton 'Quitter' a ete clique.");
		returnToLobby(false);
	});

	// On appelle notre nouvelle fonction pour creer la modale VS cachee
	createVSModal(guiTexture, gameState);

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
			returnToLobby(false);
		}
	));


	//#endregion--------------------------------------GUI-jeu----------------------------------------
}