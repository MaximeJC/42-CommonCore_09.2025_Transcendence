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
		}
		console.log("Balle creee avec succes !");
	} catch (error) {
		console.error("Erreur lors de la creation de la balle :", error);
	}
	return ball;
}

//endregion---------------------------------fin-fonctions-pong----------------------------------


//region--------------------------------------creation-objets-----------------------------------

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
		pong_arcade.getChildMeshes().forEach(mesh => {
			if(mesh.material){
				mesh.material.freeze();
			}
		});

		return pong_arcade;
	} 
	catch (error) {
		console.error("Erreur lors de l'importation du modele d'arcade :", error);
		return null; // Retourne null en cas d'erreur pour ne pas bloquer le jeu
	}
}

//endregion---------------------------------fin-creation-objets---------------------------------