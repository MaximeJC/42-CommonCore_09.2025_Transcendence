const DEBUG_MODE = true;

import Fastify from 'fastify'; // importer fastify
import cors from '@fastify/cors'; // permettra connexion au front
import dbModule from './db.js' // importer cette fonction du fichier db.js

const { db, getUserByEmail } = dbModule;
const fastify = Fastify({logger: true});

//!~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ SERVEUR ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

async function configure() {
	await fastify.register(cors, { origin: "*", }); // autoriser n'importe qui a appeler l'API de ce serveur

	fastify.get('/ping', async()=>{ return { msg: 'pong' }; });

	await fastify.listen({ port: 3000 });
	console.log('Server running on http://localhost:3000');
}

configure();

// racine de l'URL:
fastify.get('/', async (request, reply)=>{
	return { message: "Backend OK"};
});

//!~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ UTILISATEURS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// ajouter un utilisateur:
fastify.post('/users', async (request, reply)=>{
	const {login, email, password} = request.body;
	try {
		const result = await new Promise((resolve, reject)=>{
			db.run(
				`INSERT INTO users (login, email, password) VALUES (?, ?, ?)`,
				[login, email, password],
				function (err) {
					if (err) reject(err);
					else resolve(this);
				}
			);
		});
		reply.send();
	} catch (err) {
		if (DEBUG_MODE)
			console.log("Erreur d'ajout d'un utilisateur.\n");
		reply.status(500).send({error: err.message});
	}
});

// afficher les utilisateurs:
fastify.get('/users', async (request, reply)=>{
	try {
		const rows = await new Promise((resolve, reject)=>{
			db.all(
				`SELECT * FROM users`, [], (err, rows)=>{
					if (err) reject(err);
					else resolve(rows);
				}
			);
		});
		reply.send(rows);
	} catch (err) {
		if (DEBUG_MODE)
			console.log("Erreur d'affichage des utilisateurs.\n");
		reply.status(500).send({error: err.message});
	}
});

// verifier les identifiants:
fastify.post('/login', async (request, reply)=>{
	const { login, email, password } = request.body;
	const user = await getUserByEmail(email);
	if (user && user.password == password && user.login == login) {
		return { success: true, user: { login: user.login, email: user.email, password: user.password } };
	} else {
		return { success: false, message: "Wrong email, login and/or password" };
	}
});

//!~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ PARTIES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// ajouter une partie:
fastify.post('/games', async (request, reply)=>{
	const {login_winner, login_loser, score_winner, score_loser} = request.body;
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
				`INSERT INTO games (login_winner, login_loser, score_winner, score_loser) VALUES (?,?,?,?)`,
				[login_winner, login_loser, score_winner, score_loser],
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
			console.log("Erreur d'ajout de partie.\n");
		reply.status(500).send({error: err.message});
	};
});

// afficher les parties:
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

// maj du rang de classement des utilisateurs: appeler la fonction a chaque fin de partie
function updateUserRanks() {
	db.serialize(()=>{
		db.run(
		  `UPDATE users
			SET rank = (nb_won_games * 1.0) / (nb_lost_games + 1) * (nb_games + 1);`
		);
	});
}

//!~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ AMIS ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// ajouter un ami:
fastify.post('/friends', async (request, reply)=>{
	const {login1, login2} = request.body;
	if (DEBUG_MODE)
		console.log("Logins recus: ", {login1, login2});
	
	try {
		const login1Exists = await new Promise((resolve, reject)=>{
			db.get(
				`SELECT 1 FROM users WHERE login = ?`, [login1], (err, row)=>{
					if (err) reject(err);
					else {
						if (row) resolve(true);
						else resolve(false);
					}
				}
			);
		});

		if (!login1Exists)
			return reply.status(400).send({error: "Login1 not found in database."});
		if (DEBUG_MODE)
			console.log("Login1 a bien ete trouve dans la base de donnees: ", {login1});

		const login2Exists = await new Promise((resolve, reject)=>{
			db.get(
				`SELECT 1 FROM users WHERE login = ?`, [login2], (err, row)=>{
					if (err) reject(err);
					else {
						if (row) resolve(true);
						else resolve(false);
					}
				}
			);
		});

		if (!login2Exists)
			return reply.status(400).send({error: "Login2 not found in database."});
		if (DEBUG_MODE)
			console.log("Login2 a bien ete trouve dans la base de donnees: ", {login2});

		const relationExists = await new Promise((resolve, reject)=>{
			db.get(
				`SELECT 1 FROM friends WHERE (login1 = ? AND login2 = ?) OR (login2 = ? AND login1 = ?)`,
				[login1, login2, login2, login1],
				(err, row)=>{
					if (err) reject(err);
					else {
						if (row) resolve(true);
						else resolve(false);
					}
				}
			);
		});

		if (relationExists)
			return reply.status(400).send({error: "Friendship already exists."});
		
		const result = await new Promise((resolve, reject)=>{
			db.run(
				`INSERT INTO friends (login1, login2) VALUES (?,?)`,
				[login1, login2],
				(err)=>{ if (err) reject(err); }
			);
			db.run(
				`INSERT INTO friends (login1, login2) VALUES (?,?)`,
				[login2, login1],
				(err)=>{
					if (err) reject(err);
					else resolve(this);
				}
			);
		});
		reply.send({message: "Friendship saved successfully."});
	} catch (err) {
		if (DEBUG_MODE)
			console.log("Erreur d'ajout d'ami.\n");
		reply.status(500).send({error: err.message});
	}
});

// afficher les amis:
fastify.get('/friends', async (request, reply)=>{
	try {
		const friends = await new Promise((resolve, reject)=>{
			db.all(
				`SELECT * FROM friends`, [], (err, friends)=>{
					if (err) reject(err);
					else resolve(friends);
				}
			);
		});
		reply.send(friends);
	} catch (err) {
		if (DEBUG_MODE)
			console.log("Erreur d'affichage des amis.\n");
		reply.status(500).send({error: err.message});
	}
});

// supprimer un ami:
fastify.post('/friends/delete', async (request, reply)=>{
	try {
		const {login1, login2} = request.body;

		const relationExists = await new Promise((resolve, reject)=>{
			db.get(
				`SELECT 1 FROM friends WHERE (login1 = ? AND login2 = ?) OR (login2 = ? AND login1 = ?)`,
				[login1, login2, login2, login1],
				(err, row)=>{
					if (err) reject(err);
					else {
						if (row) resolve(true);
						else resolve(false);
					}
				}
			);
		});

		if (relationExists == false)
			return reply.status(400).send({message: "Friendship doesn't exist."});
		if (DEBUG_MODE)
			console.log("La relation existe bien.\n");
	
		await new Promise((resolve, reject)=>{
			db.run(
				`DELETE FROM friends WHERE (login1 = ? AND login2 = ?)`,
				[login1, login2],
				(err)=>{
					if (err) reject(err);
				}
			);
			db.run(
				`DELETE FROM friends WHERE (login1 = ? AND login2 = ?)`,
				[login2, login1],
				(err)=>{
					if (err) reject(err);
					else resolve(this);
				}
			);
		});
		reply.send({message: "Friendship successfully deleted."});
	} catch (err) {
		if (DEBUG_MODE)
			console.log("Erreur de suppression d'ami!\n");
		reply.status(500).send({error: err.message});
	}
});
