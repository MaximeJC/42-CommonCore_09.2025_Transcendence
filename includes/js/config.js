// js/config.js

//#region------------------------------------------config----------------------------------------
export const debug = false;
export const debugVisuals = false;
export const debugFps = true;


// MODIFIER ICI LE MODE DE JEU
// Options possibles: AI_VS_AI, '1P_VS_AI', '2P_LOCAL', '2P_ONLINE', '4P_ONLINE', 2AI_VS_2AI
export const gameMode = 'AI_VS_AI'; 

// Definition des limites possibles pour le terrain
export const limitUp2v2 = 25;
export const limitDown2v2 = -24;
export const limitUp4v4 = 33;
export const limitDown4v4 = -30;

export const maxScore = 5;

// Vitesses
export const speedRacket = 60;
// C'est la vitesse de depart de la balle, elle augmentera pendant le jeu.
export const initialSpeedBall = 60;

export const speedMultiplicator = 1;

export const iaResponseTime = 1000; // L'IA reevalue sa decision 1 fois par seconde

//#endregion--------------------------------------fin-config-------------------------------------