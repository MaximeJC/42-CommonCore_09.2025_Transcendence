import { updateUserRanks } from '../services/gameService.js';

export default async function leaderboardRoutes(fastify, options) {
	const { db, DEBUG_MODE } = options.deps;

	// Afficher le leaderboard
	fastify.get('/leaderboard', async (request, reply) => {
		try {
			await updateUserRanks(db);

			const leaderboard = await new Promise((resolve, reject) => {
				// WHERE nb_games > 0 -- Optionnel: pour n'afficher que les joueurs ayant joue
				db.all(
					`SELECT login as name, nb_games as games, nb_won_games as victory, rank
					FROM users				
					ORDER BY rank ASC
					LIMIT 10`,
					[],
					(err, rows) => {
						if (err) reject(err);
						else resolve(rows);
					}
				);
			});

			reply.send(leaderboard);

		} catch (err) {
			if (DEBUG_MODE) {
				console.log("Erreur lors de l'affichage du classement:", err.message);
			}
			reply.status(500).send({ error: "Erreur serveur lors de la recuperation du classement." });
		}
	});
}