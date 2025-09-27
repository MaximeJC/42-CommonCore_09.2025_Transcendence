/* Routes de gestion des parties */

import { updateUserRanks } from '../services/gameService.js';

export default async function gameRoutes(fastify) {
// ajouter une partie
	fastify.post('/games', async (request, reply)=>{
		const {login_winner, login_loser, score_winner, score_loser, game_id} = request.body;
		try {
			const winnerExists = await new Promise((resolve, reject)=>{
				db.get(
					`SELECT 1 FROM users WHERE login = ?`, [login_winner], (err, row)=>{
						if (err) reject(err);
						else {
							if (row) resolve(true);
							else resolve(false);
						}
					}
				);
			});

			const loserExists = await new Promise((resolve, reject)=>{
				db.get(
					`SELECT 1 FROM users WHERE login = ?`, [login_loser], (err, row)=>{
						if (err) reject(err);
						else {
							if (row) resolve(true);
							else resolve(false);
						}
					}
				);
			});

			if (!winnerExists || !loserExists)
				return reply.status(400).send({error: "Login not found in database."});

			const result = await new Promise((resolve, reject)=>{
				db.run(
					`INSERT INTO games (login_winner, login_loser, score_winner, score_loser, game_id) VALUES (?,?,?,?,?)`,
					[login_winner, login_loser, score_winner, score_loser, game_id],
					function(err) {
						if (err) reject(err);
						else resolve(this);
					}
				);
			});
			reply.send({message: "Game saved."});
			updateUserRanks();
		} catch (err) {
			if (DEBUG_MODE)
				console.log("Erreur d'ajout de partie.\n", err);
			reply.send({error: err.message});
		};
	});

// lister toutes les parties
	fastify.get('/games', async (request, reply)=>{
		try {
			const games = await new Promise((resolve, reject)=>{
				db.all(
					`SELECT * FROM games ORDER BY created_at DESC`, [], (err, games)=>{
						if (err) reject(err);
						else resolve(games);
					}
				);
			});
			reply.send(games);
		} catch (err) {
			if (DEBUG_MODE)
				console.log("Erreur d'affichage des parties.\n");
			reply.status(500).send({error: err.message});
		}
	});

// lister les parties d'un utilisateur specifique
	fastify.get('/games/me', async (request, reply)=>{
		const { login_current } = request.query;
		if (!login_current)
			return reply.status(400).send({ error: "Missing login." });

		try {
			const games = await new Promise((resolve, reject)=>{
				db.all(
					`SELECT * FROM games
					WHERE login_winner = ? OR login_loser = ?
					ORDER BY created_at DESC`,
					[login_current, login_current],
					(err, games)=>{
						if (err) reject(err);
						else resolve(games);
					}
				);
			});
			reply.send(games);
		} catch (err) {
			if (DEBUG_MODE)
				console.log("Erreur parties d'un utilisateur.");
			reply.status(500).send({ error: err.message });
		}
	});

	done();
}
