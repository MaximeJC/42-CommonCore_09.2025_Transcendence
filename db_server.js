const DEBUG_MODE = true;

import Fastify from 'fastify'; // importer fastify
import cors from '@fastify/cors'; // permettra connexion au front
import dbModule from './db.js' // importer cette fonction du fichier db.js
import bcrypt from 'bcrypt';
import fastifyCookie from '@fastify/cookie';
import fastifySecureSession from '@fastify/secure-session';

const { db, getUserByEmail } = dbModule;
const fastify = Fastify({logger: true});

//!~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ SERVEUR ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

await fastify.register(fastifyCookie);
await fastify.register(fastifySecureSession, {
  key: Buffer.from([
    0x7a, 0x11, 0x3c, 0x45, 0xde, 0x8a, 0xb9, 0x31,
    0x0f, 0x55, 0x99, 0x33, 0x24, 0xaf, 0xce, 0x1b,
    0xe7, 0x62, 0x91, 0x48, 0xdc, 0xfe, 0x06, 0xa0,
    0x1d, 0x3a, 0x84, 0x75, 0x2e, 0x6c, 0xbb, 0x10
  ]), //generer une cle aleatoire
  cookie: {
    path: '/',
    httpOnly: true,
    secure: false,
	sameSite: 'strict',
	saveUninitialized: false
  }
});

async function configure() {
	await fastify.register(cors, { origin: 'http://localhost:5173', credentials: true}); // autoriser n'importe qui a appeler l'API de ce serveur

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
	if (DEBUG_MODE)
		console.log("Donnees recues: ", request.body);
	if (!login || !email || !password) {
		return reply.status(400).send({ success: false, message: "Login, email and/or password is missing" });
	}
	const	hashedPassword = await bcrypt.hash(password, 10);

	try {
		const result = await new Promise((resolve, reject)=>{
			db.run(
				`INSERT INTO users (login, email, password) VALUES (?, ?, ?)`,
				[login, email, hashedPassword],
				function (err) {
					if (err) {
						if (DEBUG_MODE)
							console.log("Erreur SQL:", err.message);
						reject(err);
					} else resolve(this);
				}
			);
		});
		if (DEBUG_MODE)
			console.log("New user successfully added. ID =", result.lastID);
		reply.status(201).send({ success: true, message: "New user successfully added.", userId: result.lastID });
	} catch (err) {
		if (DEBUG_MODE)
			console.log("Erreur d'ajout d'un utilisateur:", err.stack);
		reply.status(500).send({error: err.message});
		if (err.code === 'SQLITE_CONSTRAINT') {
			if (err.message.includes('UNIQUE constraint failed: user.email'))
				return reply.status(409).send({ success: false, message: "Email already used." });
			else if (err.message.includes('UNIQUE constraint failed: users.login'))
				return reply.status(409).send({ success: false, message: "Login already used." });
		}
		reply.status(500).send({ success: false, message: "Server error: " + err.message });
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
	const { email, password } = request.body;
	if (DEBUG_MODE) {
		console.log("****************************************");
		console.log(request.body);
		console.log("****************************************");
	}

	const user = await getUserByEmail(email);
	if (DEBUG_MODE)
		console.log("Utilisateur trouve: ", user);
	if (user) {
		if (DEBUG_MODE) {
			console.log("****************************************");
			console.log('user', user);
			console.log("****************************************");
		}
		if (bcrypt.compare(password, user.password)) { //! revoir apres hachage
			if (DEBUG_MODE)
				console.log("User Ok");
			request.session.set('user', user);
			return reply.send({ success: true, user: { login: user.login, email: user.email, level: user.level } });
		}
	} else {
		if (DEBUG_MODE)
			console.log("Wrong user");
		return reply.send({ success: false, message: "Wrong email and/or password" });
	}
});

fastify.get('/me', async (req, rep) => {
	const user = req.session.get('user');
	if (!user) {
		return rep.code(401).send({ error: 'Disconnected'});
	}
	return rep.send({ user });
});

fastify.get('/logout', async (request, reply) => {
	request.session.delete('user');
	reply.clearCookie('sessionId');
	reply.send({ message: 'Deconnexion réussie'});
// 	});
});
// fastify.get('/login', async (request, reply)=>{
// 	try {
// 		const row = await new Promise((resolve, reject)=>{
// 			db.all(
// 				`SELECT * FROM users WHERE level = ?`, 1, (err, row)=>{
// 					if (err) reject(err);
// 					else resolve(row);
// 				}
// 			);
// 		});
// 		reply.send(row);
// 	} catch (err) {
// 		if (DEBUG_MODE)
// 			console.log("Erreur d'affichage des utilisateurs.\n");
// 		reply.status(500).send({error: err.message});
// 	}
// });

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

// afficher le leaderboard:
fastify.get('/leaderboard', async (request, reply)=>{
	try {
		const leaderboard = await new Promise((resolve, reject)=>{
			db.all(
				"SELECT login as name, nb_games as games, nb_won_games as victory, rank FROM users ORDER BY rank ASC LIMIT 10",
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

//!~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ UTILISATEURS CONNECTES ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Informations sur l'utilisateur actuellement connecte, pour l'affichage par connected_player_frame.vue
fastify.get('/users/current', async (request, reply)=>{
	const login = request.query.login;
	if (!login)
		return reply.status(400).send({ error: "Missing login" });
	try {
		const user = await new Promise((resolve, reject)=>{
			db.get(
				`SELECT login, nb_games, nb_won_games, rank FROM users WHERE login = ?`,
				[login],
				(err, row)=>{
					if (err) reject(err);
					else resolve(row);
				}
			);
		});
		if (!user)
			return reply.status(404).send({ error: "User not found" });
		reply.send(user);
	} catch (err) {
		console.error("Error:", err);
		reply.status(500).send({ error: err.message });
	}
});
