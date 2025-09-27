/* Statut de connexion des utilisateurs */

import { db } from '../db.js';

export async function updateIsConnected(userId) {
	db.serialize(async()=>{
		try {
			await new Promise((resolve, reject) => {
				db.run(
					`UPDATE users SET connected = ? WHERE id = ?`,
					[1, userId],
					(err) => {
						if (err) {
							console.log("Erreur de mise a jour de connexion du joueur:", err);
							reject(err);
						} else {
							resolve();
						}
					}
				);
			});
		} catch (err) {
			console.log("updateIsConnected error:", err);
		}
	});
}

export async function updateIsNotConnected(userId) {
	db.serialize(async()=>{
		try {
			await new Promise((resolve, reject) => {
				db.run(
					`UPDATE users SET connected = ? WHERE id = ?`,
					[0, userId],
					(err) => {
						if (err) {
							console.log("Erreur de mise a jour de connexion du joueur:", err);
							reject(err);
						} else {
							resolve();
						}
					}
				);
			});
		} catch (err) {
			console.log("updateIsNotConnected error:", err);
		}
	});
}