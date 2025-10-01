// maj du rang de classement des utilisateurs: appeler la fonction a chaque fin de partie
export function updateUserRanks(db) {
	return new Promise((resolve, reject) => {
		const sql = `
			WITH RankedUsers AS (
				SELECT
					id,
					ROW_NUMBER() OVER (ORDER BY (
						CASE
							WHEN nb_games = 0 THEN -1.0
							ELSE (nb_won_games * 1.0 + 2) / (nb_games * 1.0 + 4) * 100.0
						END
					) DESC) as new_rank,
					(
						CASE
							WHEN nb_games = 0 THEN -1.0
							ELSE (nb_won_games * 1.0 + 2) / (nb_games * 1.0 + 4) * 100.0
						END
					) as new_scoring
				FROM users
			)
			UPDATE users
			SET
				rank = (SELECT new_rank FROM RankedUsers WHERE RankedUsers.id = users.id),
				scoring = (SELECT new_scoring FROM RankedUsers WHERE RankedUsers.id = users.id);
		`;

		db.run(sql, [], function(err) {
			if (err) {
				console.error("Une erreur est survenue dans updateUserRanks:", err);
				return reject(err);
			}
			console.log(`Classement mis à jour. ${this.changes} lignes affectées.`);
			resolve();
		});
	});
}