/* Gestion du leaderboard */

import { db } from '../db.js';
import { updateUserRanks } from '../services/gameService.js';

export default async function leaderboardRoutes(fastify) {
// maj du leaderboard
	fastify.get('/leaderboard', async (request, reply)=>{
		try {
			updateUserRanks();
			const leaderboard = await new Promise((resolve, reject)=>{
				db.all(
					`SELECT login as name, nb_games as games, nb_won_games as victory, rank
					FROM users
					ORDER BY rank ASC
					LIMIT 10`,
					(err, rows)=>{
						if (err) reject(err);
						else resolve(rows);
					}
				);
			});
			reply.send(leaderboard);
		} catch (err) {
			if (DEBUG_MODE)
				console.log("Erreur d'affichage des parties.\n");
			reply.status(500).send({error: err.message});
		}
	});

	done();
}
