// verifier les identifiants:
export function updateIsConnected(db, userId) {
	if (!userId) {
		console.error("Tentative de mise a jour du statut de connexion avec un userId nul.");
		return;
	}

	db.run(
		`UPDATE users SET connected = 1 WHERE id = ?`,
		[userId],
		(err) => {
			if (err) {
				console.log("Erreur de mise a jour (connexion) du joueur:", err);
			}
		}
	);
}

export function updateIsNotConnected(db, userId) {
	if (!userId) {
		console.error("Tentative de mise a jour du statut de deconnexion avec un userId nul.");
		return;
	}

	db.run(
		`UPDATE users SET connected = 0 WHERE id = ?`,
		[userId],
		(err) => {
			if (err) {
				console.log("Erreur de mise a jour (deconnexion) du joueur:", err);
			}
		}
	);
}