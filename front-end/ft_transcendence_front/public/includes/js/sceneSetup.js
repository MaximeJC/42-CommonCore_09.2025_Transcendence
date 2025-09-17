// js/sceneSetup.js

import { debug } from './config.js';

/**
 * Initialise le canvas et le moteur de rendu Babylon.js.
 * Gere egalement le redimensionnement de la fenetre.
 * @returns {BABYLON.Engine} L'instance du moteur de rendu.
 */
export function initializeEngine() {
	const canvas = document.getElementById('renderCanvas');

	if (!canvas) {
		console.error("Le canvas avec l'ID 'renderCanvas' est introuvable !");
		return null;
	}
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
export let scene;
export function createScene(engine) {

	//#region---------------------------------scene, lumiere et camera-------------------------------
	
	scene = new BABYLON.Scene(engine);

	const camera = new BABYLON.UniversalCamera(
		"UniversalCamera", 
		new BABYLON.Vector3(155, 25, 0),
		scene
	);
	camera.setTarget(new BABYLON.Vector3(0, 10, 0)); 

	// ACTIVATION ET PERSONNALISATION DES CONTROLES DE LA UNIVERSALCAMERA
	const canvas = document.getElementById('renderCanvas');

	if (!canvas) {
		console.error("Le canvas avec l'ID 'renderCanvas' est introuvable !");
		return null;
	}
	camera.attachControl(canvas, true);
	camera.speed = 10.0;

	if (debug === true)
	{
		// ACTIVATION DU ZOOM A LA MOLETTE
		camera.inputs.remove(camera.inputs.attached.mousewheel);
		scene.onPrePointerObservable.add((pointerInfo) => {
			if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERWHEEL) {
				const event = pointerInfo.event;
				const forward = camera.getDirection(BABYLON.Vector3.Forward());
				const moveDistance = -(event.deltaY / 100) * 50;
				camera.position.addInPlace(forward.scale(moveDistance));
			}
		}, BABYLON.PointerEventTypes.POINTERWHEEL);

		createDebugHelpers(scene);
	}
	else
	{
		// Pour desactiver la rotation avec le clic-glisse
		camera.inputs.remove(camera.inputs.attached.mouse);
		// Pour desactiver le deplacement avec le clavier
		camera.inputs.remove(camera.inputs.attached.keyboard);
		// Pour desactiver le zoom avec la molette
		if (camera.inputs.attached.mousewheel) {
			camera.inputs.remove(camera.inputs.attached.mousewheel);
		}
	}

	const directionalLight  = new BABYLON.HemisphericLight(
		"light1",
		// new BABYLON.Vector3(-5, -3, 0),
		new BABYLON.Vector3(0, -10, 0),
		scene);
	directionalLight.position = new BABYLON.Vector3(0, 0, 0); // Position de la lumière pour le calcul des ombres
	directionalLight.intensity = 1;
	directionalLight.diffuse = BABYLON.Color3.FromHexString("#2b5ce2")

	const glowLayer = new BABYLON.GlowLayer("glow", scene);
	glowLayer.intensity = 0.5;
	

	//#endregion-----------------------------fin-scene, lumiere et camera----------------------------
	
	return { scene, camera };
}

/**
 * Fonction interne pour creer les elements de debogage (grille et axes).
 * @param {BABYLON.Scene} scene La scene a laquelle ajouter les elements.
 */
function createDebugHelpers(scene) {
	const groundDebug = BABYLON.MeshBuilder.CreateGround("groundDebug", {width: 1920, height: 1920}, scene);
	const gridMaterial = new BABYLON.GridMaterial("grid", scene);
	gridMaterial.gridRatio = 10;
	gridMaterial.majorUnitFrequency = 5; 
	groundDebug.material = gridMaterial;
	groundDebug.position = new BABYLON.Vector3(870, -301, 0);
	new BABYLON.AxesViewer(scene, 20);
}