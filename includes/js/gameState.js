// js/gameState.js

export const gameState = {
	isGameStarted: false,
	isGamePaused: false,
	isBallPaused: true,
	countdownInterval: null,
	// MODIFIER ICI LE MODE DE JEU
	// Options possibles: AI_VS_AI, '1P_VS_AI', '2P_LOCAL', '1V1_ONLINE', '4P_ONLINE', 2AI_VS_2AI
	gameMode: '1V1_ONLINE',

	// Variables qui contiendront les limites ACTIVES pour la partie en cours
	limitUp: 0,
	limitDown: 0,

	// References aux objets 3D et a l'interface utilisateur (UI)
	// Ces proprietes seront remplies au fur et a mesure de l'initialisation du jeu.
	ball: null,
	activePlayers: [],
	ui: {}, // Cet objet contiendra les references aux elements du GUI (scores, boutons, etc.)
	
	debugTrail: null,	   // Le mesh de la ligne jaune
	debugTrailPoints: [],	// Le tableau des points de la trajectoire
};