// js/gameObjects.js

import { debug, debugVisuals } from './config.js';

//region--------------------------------------fonctions-pong------------------------------------


export function createDebugArrow(scene) {
	console.log("Creation de la fleche de debogage.");
	const arrowPoints = [
		new BABYLON.Vector3(0, 0, 0), // Point de depart
		new BABYLON.Vector3(0, 0, 5)  // Point d'arrivee (longueur 5)
	];
	const arrow = BABYLON.MeshBuilder.CreateLines("debugArrow", {points: arrowPoints}, scene);
	arrow.color = new BABYLON.Color3(0, 1, 0);
	arrow.isVisible = debugVisuals; // Cachee par defaut
	return arrow;
}

export function createPlayer(scene, name, color, position, size) {
	const player = BABYLON.MeshBuilder.CreateBox(name, { size: 1 }, scene);
	const material = new BABYLON.StandardMaterial(name + "Mat", scene);
	material.diffuseColor = color;
	player.material = material;
	player.position = position;
		
	player.scaling = size; 
		
	if (debug) {
		const axes = new BABYLON.AxesViewer(scene, 2);
		axes.xAxis.parent = player;
		axes.yAxis.parent = player;
		axes.zAxis.parent = player;
	}
	return player;
}

export async function createBall(scene) {
	let ball;
	try {
		ball = BABYLON.MeshBuilder.CreateSphere("ball", { diameter: 4 }, scene);
		const material = new BABYLON.StandardMaterial("ballMat", scene);
		material.diffuseColor = new BABYLON.Color3(1, 1, 1);
		ball.material = material;
		
		if (debug){
			const axes = new BABYLON.AxesViewer(scene, 2);
			axes.xAxis.parent = ball;
			axes.yAxis.parent = ball;
			axes.zAxis.parent = ball;
			ball.isVisible = false;
		}
		console.log("Balle creee avec succes !");
	} catch (error) {
		console.error("Erreur lors de la creation de la balle :", error);
	}
	return ball;
}

//endregion---------------------------------fin-fonctions-pong----------------------------------


//region--------------------------------------creation-objets-----------------------------------

/**
 * Cree un bouton 3D interactif avec du texte dynamique.
 * @param {string} name - Le nom unique pour les objets crees.
 * @param {string} initialText - Le texte a afficher initialement sur le bouton.
 * @param {BABYLON.Scene} scene - La scene Babylon.
 * @returns {object} Un objet contenant le mesh du bouton et le textBlock pour les mises a jour.
 */
export function create3DButton(name, initialText, scene)
{
	// CREER LE MESH 3D
	// On utilise un plan pour avoir une surface plate.
	const buttonMesh = BABYLON.MeshBuilder.CreatePlane(name + "_mesh", {width: 26, height: 8}, scene);
		
	// On peut lui donner un materiau simple si on veut voir l'arriere
	const mat = new BABYLON.StandardMaterial(name + "_mat", scene);
	mat.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2); // Gris fonce
	buttonMesh.material = mat;

	// CREER UNE TEXTURE GUI SPECIFIQUEMENT POUR CE MESH
	const textureWidth = 1024;
	const textureHeight = 300;
	const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(
		buttonMesh, 
		textureWidth, 
		textureHeight
	);
	// CREER LES ELEMENTS GUI 2D SUR CETTE TEXTURE
	// Un conteneur (Rectangle) pour le style visuel du bouton (fond, bordure...)
	const buttonContainer = new BABYLON.GUI.Rectangle(name + "_container");

	buttonContainer.adaptWidthToChildren = true;
	buttonContainer.height = "100%";
	// On ajoute des marges interieures pour que le texte ne colle pas aux bords
	buttonContainer.paddingLeft = "80px";
	buttonContainer.paddingRight = "80px";

	buttonContainer.cornerRadius = 20;
	buttonContainer.color = "white"; // Couleur de la bordure
	buttonContainer.thickness = 4;   // Epaisseur de la bordure
	buttonContainer.background = "green";
	advancedTexture.addControl(buttonContainer);

	// Le texte dynamique
	const textBlock = new BABYLON.GUI.TextBlock(name + "_text", initialText);
	textBlock.resizeToFit = true;
	textBlock.color = "white";
	textBlock.fontSize = 200;
	textBlock.paddingLeft = "40px";
	textBlock.paddingRight = "40px";
	buttonContainer.addControl(textBlock); // On ajoute le texte au conteneur

	// RENDRE LE MESH 3D CLIQUABLE
	buttonMesh.actionManager = new BABYLON.ActionManager(scene);

	// On stocke la couleur initiale pour l'effet de survol
	const initialColor = buttonContainer.background;

	// Effet de survol (la souris passe dessus)
	buttonMesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
		BABYLON.ActionManager.OnPointerOverTrigger,
		function () {
			// On rend le bouton un peu plus clair
			buttonContainer.background = "lime"; 
		}
	));

	// Effet de sortie de survol (la souris quitte le mesh)
	buttonMesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
		BABYLON.ActionManager.OnPointerOutTrigger,
		function () {
			// On remet la couleur initiale
			buttonContainer.background = initialColor;
		}
	));

	// RETOURNER LE MESH ET LE TEXTBLOCK
	// On retourne un objet pour pouvoir acceder aux deux elements facilement
	return {
		mesh: buttonMesh,
		textBlock: textBlock,
		container: buttonContainer
	};
}

/**
 * Cree une zone de saisie de texte 3D interactive et personnalisable.
 * @param {string} name - Le nom unique pour les objets crees.
 * @param {string} placeholderText - Le texte a afficher quand la zone est vide.
 * @param {object} options - Un objet d'options pour personnaliser l'apparence.
 * @param {number} [options.meshWidth=40] - La largeur du mesh 3D.
 * @param {number} [options.meshHeight=7] - La hauteur du mesh 3D.
 * @param {number} [options.textureWidth=1024] - La resolution en largeur de la texture GUI.
 * @param {number} [options.textureHeight=256] - La resolution en hauteur de la texture GUI.
 * @param {number} [options.fontSize=80] - La taille de la police en pixels.
 * @param {BABYLON.Scene} scene - La scene Babylon.
 * @returns {object} Un objet contenant le mesh et l'element InputText.
 */
export function createTextBox(name, initialText, options, scene) {

	const defaultOptions = {
		meshWidth: 60,
		meshHeight: 15,
		textureWidth: 2048,
		textureHeight: 512,
		fontSize: 250,
	};
	const finalOptions = Object.assign({}, defaultOptions, options);

	const displayMesh = BABYLON.MeshBuilder.CreatePlane(name + "_mesh", {
		width: finalOptions.meshWidth, 
		height: finalOptions.meshHeight
	}, scene);
	displayMesh.isPickable = false;

	const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(
		displayMesh, 
		finalOptions.textureWidth, 
		finalOptions.textureHeight
	);
		
	const textBlock = new BABYLON.GUI.TextBlock(name + "_text", initialText);
	textBlock.width = "100%";
	textBlock.height = "100%";
	textBlock.color = finalOptions.color;
	textBlock.background = finalOptions.background;
	textBlock.fontSize = finalOptions.fontSize;
		
	// Le centrage avec TextBlock est fiable et direct.
	textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
	textBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

	advancedTexture.addControl(textBlock);

	return {
		mesh: displayMesh,
		textBlock: textBlock
	};
}

export function createTable(scene) {
	const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 80, height: 80 }, scene);
	const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
	groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
	groundMaterial.alpha = 0.50;
	ground.material = groundMaterial;
	ground.position = new BABYLON.Vector3(-1, 0, 0);
	ground.rotation = new BABYLON.Vector3(0, Math.PI, Math.PI / 2);
	return ground;
}

export async function loadArcade(scene) {
	try {
		const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./includes/assets/", "pong_arcade.glb", scene);
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
		
		// Optimisations
		pong_arcade.freezeWorldMatrix(); 
		// pong_arcade.getChildMeshes().forEach(mesh => {
		// 	if(mesh.material){
		// 		mesh.material.freeze();
		// 	}
		// });
		
		return pong_arcade;
	} 
	catch (error) {
		console.error("Erreur lors de l'importation du modele d'arcade :", error);
		return null; // Retourne null en cas d'erreur pour ne pas bloquer le jeu
	}
}

//endregion---------------------------------fin-creation-objets---------------------------------