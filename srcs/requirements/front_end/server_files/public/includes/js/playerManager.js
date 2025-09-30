// js/playerManager.js
import * as BABYLON from '@babylonjs/core';

import { createPlayer } from './gameObjects.js';
import { limitUp2v2, limitDown2v2, limitUp4v4, limitDown4v4 } from './config.js';

export function setupPlayers(scene, gameState) {

	// Choix des limites du terrain en fonction du mode de jeu
	if (gameState.gameMode === '4P_ONLINE' || gameState.gameMode === '2AI_VS_2AI') {
		gameState.limitUp = limitUp4v4;
		gameState.limitDown = limitDown4v4;
	} else {
		gameState.limitUp = limitUp2v2;
		gameState.limitDown = limitDown2v2;
	}

	// Calculs bases sur les limites actives
	const midPointY = (gameState.limitUp + gameState.limitDown) / 2;
	const racketSize1v1 = new BABYLON.Vector3(1, 30, 1);
	const racketSize2v2 = new BABYLON.Vector3(1, 15, 1);

	// Configurations de base pour tous les emplacements de joueurs possibles
	const allPlayerConfigs = {
		'left_top': {
			name: "player_left_top",
			pseudo: "Player 1",
			color: new BABYLON.Color3(1, 1, 0), // jaune
			position: new BABYLON.Vector3(0, midPointY + (gameState.limitUp - midPointY) / 2, -38),
			keys: {
				up: ['w', 'z'],
				down: 's'
			}
		},
		'left_bottom': {
			name: "player_left_bottom",
			pseudo: "Player 3",
			color: new BABYLON.Color3(0, 1, 1), // Cyan
			position: new BABYLON.Vector3(0, midPointY - (midPointY - gameState.limitDown) / 2, -38),
			keys: {
				up: 'r',
				down: 'f'
			}
		},
		'right_top': {
			name: "player_right_top",
			pseudo: "Player 2",
			color: new BABYLON.Color3(1, 0, 1), // Rose
			position: new BABYLON.Vector3(0, midPointY + (gameState.limitUp - midPointY) / 2, 38),
			keys: {
				up: 'arrowup',
				down: 'arrowdown'
			}
		},
		'right_bottom': {
			name: "player_right_bottom",
			pseudo: "Player 4",
			color: new BABYLON.Color3(0, 1, 0), // Orange
			position: new BABYLON.Vector3(0, midPointY - (midPointY - gameState.limitDown) / 2, 38),
			keys: {
				up: 'i',
				down: 'k'
			}
		}
	};

	// Le tableau qui contiendra les configurations des joueurs pour ce mode de jeu
	const playerSetups = [];

	// Creation des joueurs en fonction du mode de jeu
	switch (gameState.gameMode) {
		case 'AI_VS_AI':
			playerSetups.push({
				config: {
					pseudo: allPlayerConfigs.left_top.pseudo,
					name: allPlayerConfigs.left_top.name,
					color: allPlayerConfigs.left_top.color,
					keys: allPlayerConfigs.left_top.keys,
					position: new BABYLON.Vector3(0, 0, -38)
				},
				controlType: 'ONLINE', // Gere par le serveur
				size: racketSize1v1
			});
			playerSetups.push({
				config: {
					pseudo: allPlayerConfigs.right_top.pseudo,
					name: allPlayerConfigs.right_top.name,
					color: allPlayerConfigs.right_top.color,
					keys: allPlayerConfigs.right_top.keys,
					position: new BABYLON.Vector3(0, 0, 38)
				},
				controlType: 'ONLINE', // Gere par le serveur
				size: racketSize1v1
			});
			break;

		case '1P_VS_AI':
			playerSetups.push({
				config: {
					pseudo: allPlayerConfigs.left_top.pseudo,
					name: allPlayerConfigs.left_top.name,
					color: allPlayerConfigs.left_top.color,
					keys: allPlayerConfigs.left_top.keys,
					position: new BABYLON.Vector3(0, 0, -38)
				},
				controlType: 'KEYBOARD',
				size: racketSize1v1
			});
			playerSetups.push({
				config: {
					pseudo: "Bimo IA",
					name: allPlayerConfigs.right_top.name,
					color: allPlayerConfigs.right_top.color,
					keys: allPlayerConfigs.right_top.keys,
					position: new BABYLON.Vector3(0, 0, 38)
				},
				controlType: 'ONLINE', // L'IA est vue comme un joueur ONLINE
				size: racketSize1v1
			});
			break;

		case '2P_LOCAL':
			console.log("Configuration pour 2 Joueurs Local (gere par le serveur).");
			playerSetups.push({
				config: {
					pseudo: allPlayerConfigs.left_top.pseudo,
					name: allPlayerConfigs.left_top.name,
					color: allPlayerConfigs.left_top.color,
					keys: allPlayerConfigs.left_top.keys,
					position: new BABYLON.Vector3(0, 0, -38)
				},
				controlType: 'KEYBOARD', // Le joueur 1 est controle au clavier.
				size: racketSize1v1
			});
			playerSetups.push({
				config: {
					pseudo: allPlayerConfigs.right_top.pseudo,
					name: allPlayerConfigs.right_top.name,
					color: allPlayerConfigs.right_top.color,
					keys: allPlayerConfigs.right_top.keys,
					position: new BABYLON.Vector3(0, 0, 38)
				},
				controlType: 'KEYBOARD', // Le 2e joueur est AUSSI controle au clavier.
				size: racketSize1v1
			});
			break;
		
		case '1V1_ONLINE':
			console.log("Mode 1V1_ONLINE: En attente d'un adversaire...");
			playerSetups.push({
				config: {
					pseudo: allPlayerConfigs.left_top.pseudo,
					name: allPlayerConfigs.left_top.name,
					color: allPlayerConfigs.left_top.color,
					keys: allPlayerConfigs.left_top.keys,
					position: new BABYLON.Vector3(0, 0, -38)
				},
				controlType: 'KEYBOARD',
				size: racketSize1v1
			});
			playerSetups.push({
				config: {
					pseudo: allPlayerConfigs.right_top.pseudo,
					name: allPlayerConfigs.right_top.name,
					color: allPlayerConfigs.right_top.color,
					keys: allPlayerConfigs.right_top.keys,
					position: new BABYLON.Vector3(0, 0, 38)
				},
				controlType: 'ONLINE',
				size: racketSize1v1
			});
			break;
		
		case '2AI_VS_2AI':
			playerSetups.push({
					config: allPlayerConfigs.left_top,
					controlType: 'ONLINE',
					size: racketSize2v2
				});
			playerSetups.push({
					config: allPlayerConfigs.left_bottom,
					controlType: 'ONLINE',
					size: racketSize2v2
				}); 
			playerSetups.push({
					config: allPlayerConfigs.right_top,
					controlType: 'ONLINE',
					size: racketSize2v2
				});
			playerSetups.push({
					config: allPlayerConfigs.right_bottom,
					controlType: 'ONLINE',
					size: racketSize2v2
				});
			break;

		case '4P_ONLINE':
			console.warn("Mode 4P_ONLINE: Seul le joueur en haut a gauche est controlable localement.");
			playerSetups.push({
				config: allPlayerConfigs.left_top,
				controlType: 'KEYBOARD',
				size: racketSize2v2
			});
			playerSetups.push({
				config: allPlayerConfigs.left_bottom,
				controlType: 'ONLINE',
				size: racketSize2v2
			}); 
			playerSetups.push({
				config: allPlayerConfigs.right_top,
				controlType: 'ONLINE',
				size: racketSize2v2
			});
			playerSetups.push({
				config: allPlayerConfigs.right_bottom,
				controlType: 'ONLINE',
				size: racketSize2v2
			});
			break;
	}

	// Boucle de creation des mesh 3D pour chaque joueur actif
	// et ajout des donnees dans gameState
	playerSetups.forEach(setup => {
		const playerData = {
			config: setup.config,
			controlType: setup.controlType,
			size: setup.size,
			mesh: createPlayer(
				scene,
				setup.config.name,
				setup.config.color,
				setup.config.position,
				setup.size
			),
			moveUp: false,
			moveDown: false,
			// Cette variable stocke la derniere intention de mouvement envoyee au serveur
			// pour eviter d'envoyer des messages redondants.
			lastSentMovement: 0
		};
		gameState.activePlayers.push(playerData);
	});
}