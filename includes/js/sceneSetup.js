// js/sceneSetup.js

import { debug } from './config.js';

/**
 * Initialise le canvas et le moteur de rendu Babylon.js.
 * Gere egalement le redimensionnement de la fenetre.
 * @returns {BABYLON.Engine} L'instance du moteur de rendu.
 */
const canvas = document.getElementById("renderCanvas");
export function initializeEngine() {
	canvas.tabIndex = 1;
	canvas.focus();
	const engine = new BABYLON.Engine(canvas, true);

	window.addEventListener("resize", function () {
		engine.resize();
	});

	return engine;
}


/**
 * Cree la scene de base avec camera, lumiere et aides au debogage si necessaire.
 * @param {BABYLON.Engine} engine L'instance du moteur de rendu.
 * @returns {BABYLON.Scene} L'instance de la scene.
 */
export function createScene(engine) {

	//#region---------------------------------scene, lumiere et camera-------------------------------

	const scene = new BABYLON.Scene(engine);
		
	const camera = new BABYLON.ArcRotateCamera(
		"Camera",
		BABYLON.Tools.ToRadians(0),
		BABYLON.Tools.ToRadians(80),
		150,
		new BABYLON.Vector3(0, 10, 0),
		scene
	);
	camera.attachControl(canvas, false);
	// Pour desactiver la rotation avec le clic-glisse
	camera.inputs.attached.pointers.detachControl();
	// Pour desactiver le zoom avec la molette
	camera.inputs.attached.mousewheel.detachControl();
	// Pour desactiver le deplacement avec le clavier
	camera.inputs.attached.keyboard.detachControl();
	
	const light = new BABYLON.HemisphericLight(
		"light1",
		new BABYLON.Vector3(0, 1, 0),
		scene
	); 
	light.intensity = 1;

	//#endregion-----------------------------fin-scene, lumiere et camera----------------------------


	//#region-----------------------------------ground grille / axes---------------------------------

	if (debug === true) {
		createDebugHelpers(scene);
	}

	//#endregion-----------------------------fin-ground grille / axes--------------------------------
	
	return scene;
}


/**
 * Fonction interne pour creer les elements de debogage (grille et axes).
 * @param {BABYLON.Scene} scene La scene a laquelle ajouter les elements.
 */
function createDebugHelpers(scene) {
	const groundDebug = BABYLON.MeshBuilder.CreateGround("groundDebug", {width: 500, height: 500}, scene);
	const gridMaterial = new BABYLON.GridMaterial("grid", scene);
	gridMaterial.gridRatio = 10;
	gridMaterial.majorUnitFrequency = 5; 
	groundDebug.material = gridMaterial;
	new BABYLON.AxesViewer(scene, 20);
}