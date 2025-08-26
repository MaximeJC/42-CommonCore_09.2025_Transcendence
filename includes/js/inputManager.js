// js/inputManager.js

import { gameMode } from './config.js';

export const inputMap = {};

export function setupInputManager(scene, gameState) {

	scene.actionManager = new BABYLON.ActionManager(scene);

	scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
		BABYLON.ActionManager.OnKeyDownTrigger, function(evt) {
			const key = evt.sourceEvent.key.toLowerCase();

			// Logique de la pause
			if (key === 'escape' && gameState.isGameStarted) {
				// La pause n'est disponible que pour les modes de jeu locaux
				if (gameMode === '1P_VS_AI' || gameMode === '2P_LOCAL') {
					if (gameState.isGamePaused) {
						gameState.isGamePaused = false;
					} else {
						gameState.isGamePaused = true;
					}
					
					gameState.ui.pauseText.mesh.isVisible = gameState.isGamePaused; // On affiche ou cache le texte
					
					// Gere la visibilite du compte a rebours pendant la pause
					if (gameState.countdownInterval) {
						if (gameState.isGamePaused) {
							gameState.ui.countdownText.mesh.isVisible = false;
						} else {
							gameState.ui.countdownText.mesh.isVisible = true;
						}
					}
				}
			}
			
			inputMap[key] = true;
		}
	));

	scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
		BABYLON.ActionManager.OnKeyUpTrigger, function(evt) {
			inputMap[evt.sourceEvent.key.toLowerCase()] = false;
		}
	));
}