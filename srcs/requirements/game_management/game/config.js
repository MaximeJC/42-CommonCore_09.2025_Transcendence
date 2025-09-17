// pong-server/game/config.js

export const maxScore = 5;

export const initialSpeedBall = 60;
export const speedMultiplicator = 1.01;

export const speedRacket = 60;

// --- Limites pour les parties a 2 joueurs (1v1) ---
export const limitUp2v2 = 25;
export const limitDown2v2 = -24;

// --- Limites pour les parties a 4 joueurs (2v2) ---
export const limitUp4v4 = 33;
export const limitDown4v4 = -30;

export const wallLimit = 38; // Position Y des murs haut et bas
export const goalLimit = 40; // Position Z a laquelle un but est marque

export const racketHeight1v1 = 30; // Hauteur d'une raquette en 1v1
export const racketHeight2v2 = 15; // Hauteur d'une raquette en 2v2
export const ballRadius = 2; // Rayon de la balle pour les calculs de collision

export const iaApiUrl = "http://localhost:3001";