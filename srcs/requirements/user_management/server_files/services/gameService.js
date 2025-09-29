// maj du rang de classement des utilisateurs: appeler la fonction a chaque fin de partie
export function updateUserRanks(db) {
	return new Promise((resolve, reject) => {
		db.serialize(async () => {
			try {
				await new Promise((res, rej) => {
					db.run(
						`UPDATE users
						 SET scoring = CASE
							 WHEN nb_games = 0 THEN -1
							 ELSE (nb_won_games * 1.0 + 2) / (nb_games * 1.0 + 4) * 100.0
						 END`,
						(err) => {
							if (err) {
								console.error("Erreur lors de la mise a jour du scoring :", err);
								return rej(err);
							}
							res();
						}
					);
				});

				const players = await new Promise((res, rej) => {
					db.all(
						`SELECT id FROM users ORDER BY scoring DESC`,
						(err, rows) => {
							if (err) {
								console.error("Erreur de recuperation des joueurs pour le classement :", err);
								return rej(err);
							}
							res(rows);
						}
					);
				});

				for (let i = 0; i < players.length; i++) {
					const user = players[i];
					const newRank = i + 1;
					await new Promise((res, rej) => {
						db.run(
							`UPDATE users SET rank = ? WHERE id = ?`,
							[newRank, user.id],
							(err) => {
								if (err) {
									console.log("Erreur de mise a jour du rang pour l'utilisateur:", user.id, err);
									return rej(err);
								}
								res();
							}
						);
					});
				}
				resolve();

			} catch (err) {
				console.log("Une erreur est survenue dans updateUserRanks:", err);
				reject(err);
			}
		});
	});
}