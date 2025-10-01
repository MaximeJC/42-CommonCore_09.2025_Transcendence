import { updateUserRanks } from '../services/gameService.js';

export default async function gameRoutes(fastify, options) {
	const { db, getUserByLogin, DEBUG_MODE } = options.deps;

	// Ajouter une partie
	fastify.post('/games', async (request, reply) => {
		const { login_winner, login_loser, score_winner, score_loser, game_id } = request.body;
	
		try {
			const winner = await getUserByLogin(login_winner);
			const loser = await getUserByLogin(login_loser);
	
			if (!winner || !loser) {
				return reply.send({ error: "Un des logins est introuvable dans la base de donnees." });
			}
	
			const winner_id = winner.id;
			const loser_id = loser.id;
	
			const exists = await new Promise((resolve, reject) => {
				db.all(
					`SELECT 1 FROM games WHERE game_id = ?`,
					[game_id],
					(err, rows) => {
						if (err) reject(err);
						else resolve(rows.length > 0);
					}
				);
			});
	
			if (exists) {
				return reply.send({ message: "Partie deja enregistree." });
			}
			else{
				// Inserer la partie
				await new Promise((resolve, reject) => {
					db.run(
						`INSERT INTO games (id_winner, id_loser, score_winner, score_loser, game_id) VALUES (?, ?, ?, ?, ?)`,
						[winner_id, loser_id, score_winner, score_loser, game_id],
						function (err) {
							if (err) reject(err);
							else resolve(this);
						}
					);
				});

				await updateUserRanks(db);

				reply.send({ message: "Partie enregistree avec succes." });
			}
	
			
	
		} catch (err) {
			if (DEBUG_MODE)
				console.log("Erreur lors de l'ajout de la partie:", err);
			reply.send({ error: "Erreur serveur lors de l'ajout de la partie." });
		}
	});

	// Afficher toutes les parties
	fastify.get('/games', async (request, reply) => {
		try {
			const games = await new Promise((resolve, reject) => {
				db.all(
					`SELECT
						g.game_id,
						winner.login as login_winner,
						loser.login as login_loser,
						g.score_winner,
						g.score_loser,
						g.created_at
					 FROM games g
					 JOIN users winner ON g.id_winner = winner.id
					 JOIN users loser ON g.id_loser = loser.id
					 ORDER BY g.created_at DESC`,
					[],
					(err, rows) => {
						if (err) reject(err);
						else resolve(rows);
					}
				);
			});
			reply.send(games);
		} catch (err) {
			if (DEBUG_MODE) {
				console.log("Erreur d'affichage des parties.");
			}
			reply.status(500).send({ error: "Erreur serveur lors de la recuperation des parties." });
		}
	});

	// Afficher les parties d'un utilisateur specifique
	fastify.get('/games/me', async (request, reply) => {
		const { login_current } = request.query;
		if (!login_current) {
			return reply.status(400).send({ error: "Login manquant dans la requete." });
		}

		try {
			const user_current = await getUserByLogin(login_current);
			if (!user_current) {
				return reply.status(404).send({ error: "Utilisateur non trouve." });
			}
			
			const login_current_id = user_current.id;

			const games = await new Promise((resolve, reject) => {
				db.all(
					`SELECT
						g.game_id,
						winner.login as login_winner,
						loser.login as login_loser,
						g.score_winner,
						g.score_loser,
						g.created_at
					 FROM games g
					 JOIN users winner ON g.id_winner = winner.id
					 JOIN users loser ON g.id_loser = loser.id
					 WHERE g.id_winner = ? OR g.id_loser = ?
					 ORDER BY g.created_at DESC`,
					[login_current_id, login_current_id],
					(err, rows) => {
						if (err) reject(err);
						else resolve(rows);
					}
				);
			});
			reply.send(games);
		} catch (err) {
			if (DEBUG_MODE) {
				console.log("Erreur de recuperation des parties d'un utilisateur.");
			}
			reply.status(500).send({ error: "Erreur serveur lors de la recuperation des parties." });
		}
	});
}