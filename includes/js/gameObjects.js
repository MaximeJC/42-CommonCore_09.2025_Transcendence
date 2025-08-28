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
	player.material.emissiveColor = color;
		
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
		
		// On definit la couleur de base
		const ballColor = new BABYLON.Color3(0, 1, 1);
		material.diffuseColor = ballColor;
		
		// La balle va briller de cette couleur, meme dans le noir.
		material.emissiveColor = ballColor;
		material.ambientColor = ballColor;

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
	mat.alpha = 0; // invisible, juste support
	buttonMesh.material = mat;

	// CREER UNE TEXTURE GUI SPECIFIQUEMENT POUR CE MESH
	const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(buttonMesh, 1024, 300);

		// CREER LES ELEMENTS GUI 2D SUR CETTE TEXTURE
	// Un conteneur (Rectangle) pour le style visuel du bouton (fond, bordure...)
	const buttonContainer = new BABYLON.GUI.Rectangle(name + "_container");
	buttonContainer.background = "rgba(156, 50, 133, 1)"; // violet transparent
	buttonContainer.color = "#e251ca"; // bordure rose
	buttonContainer.thickness = 8; // border: 2px
	buttonContainer.cornerRadius = 100; // border-radius: 5px
	advancedTexture.addControl(buttonContainer);

	// Ombres (box-shadow simulé par glow)
	const gl = new BABYLON.GlowLayer(name + "_glow", scene, { blurKernelSize: 64 });
	gl.addIncludedOnlyMesh(buttonMesh);
	gl.intensity = 1.5;
	gl.customEmissiveColorSelector = function(mesh, subMesh, material, result) {
		if (mesh === buttonMesh) {
			result.set(0.87, 0.04, 0.73, 0.8); // #dd0aba violet
		}
	};

	const textBlock = new BABYLON.GUI.TextBlock(name + "_text", initialText);
	textBlock.fontFamily = "netron";
	textBlock.color = "#aaaaaaff";
	textBlock.fontSize = 200;
	textBlock.fontWeight = "bold";
	textBlock.paddingLeft = "40px";
	textBlock.paddingRight = "40px";
	textBlock.adaptWidthToChildren = true;

	buttonContainer.addControl(textBlock);  // On ajoute le texte au conteneur

	// RENDRE LE MESH 3D CLIQUABLE
	buttonMesh.actionManager = new BABYLON.ActionManager(scene);

	// Effet de survol (la souris passe dessus)
	buttonMesh.actionManager.registerAction(
		new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPointerOverTrigger, function () {
			// On rend le bouton plus clair
			buttonContainer.background = "rgba(84, 85, 0, 0.8)";
			buttonContainer.color = "#fbff22"; // bordure jaune
			
			// glow hover (équiv box-shadow jaune)
			gl.customEmissiveColorSelector = function(mesh, subMesh, material, result) {
				if (mesh === buttonMesh) {
					result.set(1, 1, 0.13, 0.8); // #fbff22 jaune
				}
			};
		})
	);

	// Effet de sortie de survol (la souris quitte le mesh)
	buttonMesh.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
		BABYLON.ActionManager.OnPointerOutTrigger,
		function () {
			// On remet la couleur initiale
			buttonContainer.background = "rgba(156, 50, 133, 1)";
			buttonContainer.color = "#e251ca";

			gl.customEmissiveColorSelector = function(mesh, subMesh, material, result) {
				if (mesh === buttonMesh) {
					result.set(0.87, 0.04, 0.73, 1); // violet
				}
			};
		})
	);

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

	textBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
	textBlock.textVerticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;

	advancedTexture.addControl(textBlock);

	return {
		mesh: displayMesh,
		textBlock: textBlock
	};
}

export function createTable(scene) {
	const table = BABYLON.MeshBuilder.CreateGround("table", { width: 80, height: 80 }, scene);
	const tableMaterial = new BABYLON.StandardMaterial("tableMat", scene);
	tableMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.2, 0.2);
	tableMaterial.alpha = 0;
	table.material = tableMaterial;
	table.position = new BABYLON.Vector3(-1, 0, 0);
	table.rotation = new BABYLON.Vector3(0, Math.PI, Math.PI / 2);
	return table;
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
		const table = createTable(scene);
		
		return pong_arcade;
	} 
	catch (error) {
		console.error("Erreur lors de l'importation du modele d'arcade :", error);
		return null; // Retourne null en cas d'erreur pour ne pas bloquer le jeu
	}
}

export async function loadArcadeMachines(scene) {
	try {
		const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./includes/assets/", "ArcadeMachines.glb", scene);
		const ArcadeMachines = result.meshes[0];
		ArcadeMachines.position = new BABYLON.Vector3(50, -75, 300);

		if (debug) {
			const axesArcadeMachines = new BABYLON.AxesViewer(scene, 2);
			axesArcadeMachines.xAxis.parent = ArcadeMachines;
			axesArcadeMachines.yAxis.parent = ArcadeMachines;
			axesArcadeMachines.zAxis.parent = ArcadeMachines;
		}
		console.log("Machine d'arcade importee avec succes !");
		
		// Optimisations
		ArcadeMachines.freezeWorldMatrix(); 
		return ArcadeMachines;
	} 
	catch (error) {
		console.error("Erreur lors de l'importation du modele machine d'arcade :", error);
		return null;
	}
}

export async function loadDDM(scene) {
	try {
		const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./includes/assets/", "DDM.glb", scene);
		const DDM = result.meshes[0];
		DDM.position = new BABYLON.Vector3(200, -45, -650);

		if (debug) {
			const axesDDM = new BABYLON.AxesViewer(scene, 2);
			axesDDM.xAxis.parent = DDM;
			axesDDM.yAxis.parent = DDM;
			axesDDM.zAxis.parent = DDM;
		}
		console.log("DDM importee avec succes !");
		
		// Optimisations
		DDM.freezeWorldMatrix(); 
		return DDM;
	} 
	catch (error) {
		console.error("Erreur lors de l'importation du modele DDM :", error);
		return null;
	}
}

export async function loadSugarRush(scene) {
	try {
		const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./includes/assets/", "sugar_rush.glb", scene);
		const SugarRush = result.meshes[0];
		SugarRush.position = new BABYLON.Vector3(830, -10, -790);

		if (debug) {
			const axesSugarRush = new BABYLON.AxesViewer(scene, 2);
			axesSugarRush.xAxis.parent = SugarRush;
			axesSugarRush.yAxis.parent = SugarRush;
			axesSugarRush.zAxis.parent = SugarRush;
		}
		console.log("SugarRush importee avec succes !");
		
		// Optimisations
		SugarRush.freezeWorldMatrix(); 
		return SugarRush;
	} 
	catch (error) {
		console.error("Erreur lors de l'importation du modele Sugar Rush :", error);
		return null;
	}
}

export async function loadHockey(scene) {
	try {
		const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./includes/assets/", "Hockey.glb", scene);
		const Hockey = result.meshes[0];
		Hockey.position = new BABYLON.Vector3(800, -166, -200);

		if (debug) {
			const axesHockey = new BABYLON.AxesViewer(scene, 2);
			axesHockey.xAxis.parent = Hockey;
			axesHockey.yAxis.parent = Hockey;
			axesHockey.zAxis.parent = Hockey;
		}
		console.log("Hockey importee avec succes !");
		
		// Optimisations
		Hockey.freezeWorldMatrix(); 
		return Hockey;
	} 
	catch (error) {
		console.error("Erreur lors de l'importation du modele Hockey :", error);
		return null;
	}
}

export async function loadWhackAMole(scene) {
	try {
		const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./includes/assets/", "Whack_a_mole.glb", scene);
		const WhackAMole = result.meshes[0];
		WhackAMole.position = new BABYLON.Vector3(1300, -100, -875);

		if (debug) {
			const axesWhackAMole = new BABYLON.AxesViewer(scene, 2);
			axesWhackAMole.xAxis.parent = WhackAMole;
			axesWhackAMole.yAxis.parent = WhackAMole;
			axesWhackAMole.zAxis.parent = WhackAMole;
		}
		console.log("WhackAMole importee avec succes !");
		
		// Optimisations
		WhackAMole.freezeWorldMatrix(); 
		return WhackAMole;
	} 
	catch (error) {
		console.error("Erreur lors de l'importation du modele WhackAMole :", error);
		return null;
	}
}

export async function loadBubblegum(scene) {
	try {
		const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./includes/assets/", "Bubblegum.glb", scene);
		const Bubblegum = result.meshes[0];
		Bubblegum.position = new BABYLON.Vector3(1300, -190, 400);

		if (debug) {
			const axesBubblegum = new BABYLON.AxesViewer(scene, 2);
			axesBubblegum.xAxis.parent = Bubblegum;
			axesBubblegum.yAxis.parent = Bubblegum;
			axesBubblegum.zAxis.parent = Bubblegum;
		}
		console.log("Bubblegum importee avec succes !");
		
		// Optimisations
		Bubblegum.freezeWorldMatrix(); 
		return Bubblegum;
	} 
	catch (error) {
		console.error("Erreur lors de l'importation du modele Bubblegum :", error);
		return null;
	}
}

export async function loadTronArcade(scene) {
	try {
		const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./includes/assets/", "TronArcade.glb", scene);
		const TronArcade = result.meshes[0];
		TronArcade.position = new BABYLON.Vector3(-125, -300, -200);
		TronArcade.rotation = new BABYLON.Vector3(0, -Math.PI / 2, 0);


		if (debug) {
			const axesTronArcade = new BABYLON.AxesViewer(scene, 2);
			axesTronArcade.xAxis.parent = TronArcade;
			axesTronArcade.yAxis.parent = TronArcade;
			axesTronArcade.zAxis.parent = TronArcade;
		}
		console.log("TronArcade importee avec succes !");
		
		// Optimisations
		TronArcade.freezeWorldMatrix(); 
		return TronArcade;
	} 
	catch (error) {
		console.error("Erreur lors de l'importation du modele TronArcade :", error);
		return null;
	}
}

export async function loadPacman(scene) {
	try {
		const result = await BABYLON.SceneLoader.ImportMeshAsync("", "./includes/assets/", "pacman.glb", scene);
		const Pacman = result.meshes[0];
		Pacman.position = new BABYLON.Vector3(-24, -300, 820);
		Pacman.rotation = new BABYLON.Vector3(0, -Math.PI / 2, 0);


		if (debug) {
			const axesPacman = new BABYLON.AxesViewer(scene, 2);
			axesPacman.xAxis.parent = Pacman;
			axesPacman.yAxis.parent = Pacman;
			axesPacman.zAxis.parent = Pacman;
		}
		console.log("Pacman importee avec succes !");
		
		// Optimisations
		// Pacman.freezeWorldMatrix(); 
		return Pacman;
	} 
	catch (error) {
		console.error("Erreur lors de l'importation du modele Pacman :", error);
		return null;
	}
}

//endregion---------------------------------fin-creation-objets---------------------------------

//endregion------------------------------------decors-objets------------------------------------

export function createRoom(scene) {
	createGround(scene);
	// createCeiling(scene);
	createWallBack(scene);
	// createWallFront(scene);
	// createWallRight(scene);
	createWallLeft(scene);
}

function createGround(scene) {
	const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 1920, height: 1920 }, scene);
	const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);

	const texturePath = "./includes/assets/textures/arcade_carpet_42.png";
	groundMaterial.emissiveTexture = new BABYLON.Texture(texturePath, scene);

	const texture = groundMaterial.emissiveTexture;
		
	// repeter X fois sur la largeur et la hauteur.
	texture.uScale = 2.0; // Repetition sur l'axe horizontal (U)
	texture.vScale = 2.0; // Repetition sur l'axe vertical (V)

		
	if (texturePath.endsWith(".png")) {
		texture.hasAlpha = true;
	}

	groundMaterial.backFaceCulling = false;
	ground.material = groundMaterial;
	ground.position = new BABYLON.Vector3(870, -300, 0);
	ground.rotation = new BABYLON.Vector3(0, -Math.PI, 0);
	console.log("ground importee avec succes !");

	return ground;
}

function createCeiling(scene) {
	const ceilingMesh = BABYLON.MeshBuilder.CreateGround("ceilingMesh", { width: 1920, height: 1920 }, scene);
	const ceilingMaterial = new BABYLON.StandardMaterial("ceilingMat", scene);
	ceilingMaterial.diffuseColor = BABYLON.Color3.FromHexString("#747474");
	ceilingMaterial.backFaceCulling = true; 
	ceilingMesh.material = ceilingMaterial;
	ceilingMesh.position = new BABYLON.Vector3(870, 250, 0);
	ceilingMesh.rotation.x = Math.PI;
	console.log("Plafond cree avec succes !");

	return ceilingMesh;
}

function createWallBack(scene) {
	const wallBack = BABYLON.MeshBuilder.CreatePlane("wallBack", { width: 1920, height: 550 }, scene);
	const wallBackMaterial = new BABYLON.StandardMaterial("wallBackMat", scene);
	const hexColor = "#00013b";
	const alphaValue = 1.0;
	wallBackMaterial.diffuseColor = BABYLON.Color3.FromHexString(hexColor);
	wallBackMaterial.alpha = alphaValue;
	wallBackMaterial.backFaceCulling = false;
	wallBack.material = wallBackMaterial;
	wallBack.position = new BABYLON.Vector3(-90, -25, 0);
	wallBack.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0);
	return wallBack;
}

function createWallFront(scene) {
	const wallFront = BABYLON.MeshBuilder.CreatePlane("wallFront", { width: 1920, height: 550 }, scene);
	const wallFrontMaterial = new BABYLON.StandardMaterial("wallFrontMat", scene);
	wallFrontMaterial.diffuseColor = new BABYLON.Color3(0.45, 0.45, 0.45); // #747474
	wallFrontMaterial.backFaceCulling = false;
	wallFront.material = wallFrontMaterial;
	wallFront.position = new BABYLON.Vector3(1830, -25, 0);
	wallFront.rotation = new BABYLON.Vector3(0, Math.PI / 2, 0); // orientation verticale
	return wallFront;
}

function createWallRight(scene) {
	const wallRight = BABYLON.MeshBuilder.CreatePlane("wallRight", { width: 550, height: 1920 }, scene);
	const wallRightMaterial = new BABYLON.StandardMaterial("wallRightMat", scene);
	wallRightMaterial.diffuseColor = new BABYLON.Color3(0.45, 0.45, 0.45); // #747474
	wallRightMaterial.backFaceCulling = false;
	wallRight.material = wallRightMaterial;
	wallRight.position = new BABYLON.Vector3(870, -25, 960);
	wallRight.rotation = new BABYLON.Vector3(0, 0, Math.PI / 2);
	return wallRight;
}

function createWallLeft(scene) {
	const wallLeft = BABYLON.MeshBuilder.CreatePlane("wallLeft", { width: 550, height: 1920 }, scene);
	const wallLeftMaterial = new BABYLON.StandardMaterial("wallLeftMat", scene);
	wallLeftMaterial.diffuseColor = new BABYLON.Color3(0.45, 0.45, 0.45); // #747474
	wallLeftMaterial.backFaceCulling = false;
	wallLeft.material = wallLeftMaterial;
	wallLeft.position = new BABYLON.Vector3(870, -25, -960);
	wallLeft.rotation = new BABYLON.Vector3(0, 0, Math.PI / 2);
	return wallLeft;
}

//endregion---------------------------------fin-decors-objets-----------------------------------
