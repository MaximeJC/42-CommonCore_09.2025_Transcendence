/* Leaderboard: maj du rang des utilisateurs en fonction d'un calcul de score */

import { db } from '../db.js';

export async function updateUserRanks() {
	db.serialize(async()=>{
		try {
			await new Promise((resolve, reject)=>{ // scoring = variable resultat d'un calcul qui permettra de classer les joueurs (rank), en forcant a 1 un diviseur de 0.
				db.run(
					`UPDATE users
					SET scoring = CASE
						WHEN nb_games = 0 THEN -1
						ELSE (nb_won_games * 1.0 + 2) / (nb_games * 1.0 + 4) * 100.0
					END`,
					(err)=>{
						if (err) {
							console.error("Erreur lors de la mise à jour du scoring :", err);
							reject(err);
						} else {
							resolve();
						}
					}
				);
			});
			const players = await new Promise((resolve, reject)=>{
				db.all( // ordonner les utilisateurs par score croissant
					`SELECT id, scoring
					FROM users
					ORDER BY scoring DESC`,
					(err, rows)=>{
						if (err) {
							console.error("Erreur de recuperation des utilisateurs dans updateUserRank:", err);
							reject(err);
						} else {
							resolve(rows);
						}
					}
				);
			});
			for (let i = 0; i < players.length; i++) {
				const user = players[i];
				await new Promise((resolve, reject) => {
					db.run( // attribuer a chaque utilisateur son rang, qui est desormais son id + 1 (car id part de 0 et rank de 1)
						`UPDATE users SET rank = ? WHERE id = ?`,
						[i + 1, user.id],
						(err) => {
								if (err) {
									console.log("Erreur de mise a jour de rank des joueurs:", err);
									reject(err);
								} else {
									resolve();
								}
						}
					);
				});
			}
		} catch (err) {
			console.log("updateUserRank error:", err);
		}
	});
}
