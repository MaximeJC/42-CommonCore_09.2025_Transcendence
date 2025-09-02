// js/gameState.js
import { initialSpeedBall } from './config.js';

export const gameState = {
	//Vitesses
	speedBall: initialSpeedBall,

	//Variables de jeu
	scoreLeft: 0,
	scoreRight: 0,
	ballDirection: new BABYLON.Vector3(0, 0, 0),
	isGameStarted: false,
	isGamePaused: false,
	isBallPaused: true,
	countdownInterval: null,
	// MODIFIER ICI LE MODE DE JEU
	// Options possibles: AI_VS_AI, '1P_VS_AI', '2P_LOCAL', '2P_ONLINE', '4P_ONLINE', 2AI_VS_2AI
	gameMode: '1P_VS_AI',
		
	//pour I.A
	aiDecision: { moveUp: false, moveDown: false }, // Stocke la decision de l'IA
	aiUpdateInterval: null,

	// Variables qui contiendront les limites ACTIVES pour la partie en cours
	limitUp: 0,
	limitDown: 0,

	// References aux objets 3D et a l'interface utilisateur (UI)
	// Ces proprietes seront remplies au fur et a mesure de l'initialisation du jeu.
	ball: null,
	activePlayers: [],
	debugTrail: null,	   // Le mesh de la ligne jaune
	debugTrailPoints: [],	// Le tableau des points de la trajectoire
	ui: {} // Cet objet contiendra les references aux elements du GUI (scores, boutons, etc.)
};