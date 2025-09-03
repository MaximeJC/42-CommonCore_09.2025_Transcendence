// pong-server/game/gameState.js

import { initialSpeedBall } from './config.js';

/**
 * Cree et retourne un objet gameState "pur" pour une nouvelle partie sur le serveur.
 * Il ne contient que des donnees, pas d'objets 3D ou d'elements d'interface.
 * C'est le modele de l'etat d'une partie.
 */
export function createInitialGameState() {
	return {
		// --- Donnees de vitesse ---
		speedBall: initialSpeedBall,

		// --- Donnees de la partie ---
		scoreLeft: 0,
		scoreRight: 0,
		ballDirection: { y: 0, z: 0 },
		isGameStarted: false,
		isBallPaused: true,
		gameMode: null, // Sera defini par la GameInstance (ex: '1P_VS_AI')

		// --- Donnees pour l'IA
		aiDecision: { moveUp: false, moveDown: false },

		// Donnees sur les limites du terrain pour cette partie specifique
		limitUp: 0,
		limitDown: 0,

		// References aux objets physiques
		ball: {
			position: { y: 0, z: 0 }
		},
		activePlayers: [], // Sera rempli avec des objets comme { id, y, movement, controlType, ... }
	};
}