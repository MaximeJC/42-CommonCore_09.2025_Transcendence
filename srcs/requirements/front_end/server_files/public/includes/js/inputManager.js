// js/inputManager.js
import * as BABYLON from '@babylonjs/core';

export const inputMap = {};

/**
 * Met en place les ecouteurs d'evenements pour les entrees clavier.
 * @param {BABYLON.Scene} scene - La scene Babylon.
 * @param {object} gameState - L'etat du jeu (pour reference future).
 */
export function setupInputManager(scene, gameState) {

	scene.actionManager = new BABYLON.ActionManager(scene);

	// Gere l'evenement lorsqu'une touche est pressee.
	scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
		BABYLON.ActionManager.OnKeyDownTrigger, function(evt) {
			const key = evt.sourceEvent.key.toLowerCase();

			// on enregistre que la touche est pressee.
			inputMap[key] = true;
		}
	));

	// Gere l'evenement lorsqu'une touche est relachee.
	scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
		BABYLON.ActionManager.OnKeyUpTrigger, function(evt) {
			inputMap[evt.sourceEvent.key.toLowerCase()] = false;
		}
	));
}