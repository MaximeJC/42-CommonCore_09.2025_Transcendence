const DEBUG_MODE = true;

import Fastify from 'fastify'; // importer fastify
import cors from '@fastify/cors'; // permettra connexion au front
import dbModule from './db.js' // importer cette fonction du fichier db.js
import bcrypt from 'bcrypt';
import fastifyCookie from '@fastify/cookie';
import fastifySecureSession from '@fastify/secure-session';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import { dirname } from 'path';

import crypto from 'crypto';
import { pipeline } from 'stream/promises'; // Pour gérer les flux proprement
import fs from 'fs'; // Pour créer le flux d'écriture
import path from 'path';
import { fileURLToPath } from 'url';

const { db, getUserByEmail } = dbModule;
const fastify = Fastify({logger: true});

//!~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ SERVEUR ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

await fastify.register(fastifyCookie);
await fastify.register(fastifySecureSession, {
  key: crypto.randomBytes(32), //generer une cle aleatoire
  cookie: {
	path: '/',
	httpOnly: true,
	secure: false,
	sameSite: 'lax',
	saveUninitialized: false
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const newdir = path.join(__dirname, '../..', 'front-end/ft_transcendence_front/');

await fastify.register(fastifyMultipart);
await fastify.register(fastifyStatic, {
	root: path.join(newdir, 'uploads'),
	prefix: '/uploads/',
});

fastify.post('/upload-avatar', async (request, reply) => {
	try {
		const data = await request.file();
		if (!data) {
			return reply.status(400).send({ error: 'No file uploaded' });
		}

		const user = request.session.get('user');
		if (!user || !user.login) {
			return reply.status(401).send({ error: 'User not logged in' });
		}

		const filename = `${user.login}-${data.filename}`;
		const saveTo = path.join(newdir, 'uploads', filename); //TODO : Voir pour le bon chemin

		try {

			const fileToDelete = fs.readdirSync(`${newdir}/uploads`);
			console.log("fileToDelete:", fileToDelete);
			for (const file of fileToDelete) {
				console.log("file:", file);
				if (file.startsWith(`${user.login}-`)) {
					fs.unlinkSync(path.join(`${newdir}/uploads`, file));
				}
			}

			// Utiliser pipeline pour sauvegarder le fichier de maniere securisee et efficace
			console.log(`[AVATAR] Sauvegarde dans: ${saveTo}`);
			await pipeline(data.file, fs.createWriteStream(saveTo));
			console.log(`[AVATAR] Fichier sauvegarde avec succes.`);

		} catch (err) {
			console.error("Erreur lors de la sauvegarde du fichier:", err);
			return reply.status(500).send({ error: 'Could not save the file' });
		}

		const relativePath = `/uploads/${filename}`;

		console.log(`[AVATAR] Mise a jour de la BDD pour l'utilisateur ${user.login} avec le chemin ${relativePath}`);
		
		await new Promise((resolve, reject) => {
			db.run(
				'UPDATE users SET avatar_url = ? WHERE login = ?',
				[relativePath, user.login],
					function (err) {
					if (err) {
						reject(err);
					} else {
						resolve();
					}
				}
			);
		});

		console.log(`[AVATAR] BDD mise a jour avec succes.`);

		reply.send({ message: 'Avatar uploaded', avatar_url: relativePath });
	} catch (error) {
		console.error("!!! ERREUR INTERNE DANS /upload-avatar !!!", error);
		return reply.status(500).send({ 
			message: 'Internal Server Error', 
			error: error.message
		});
	}
});


// fastify.get('/upload-avatar', async (request, reply) => {
// 	const data = await request.file();
// 	if (!data)
// 		return reply.send({ error: 'NO avatar'});
// 	return reply.send({ data });

// });

async function configure() {
	const allowedOrigin = ['http://localhost:5173','http://127.0.0.1:5173', 'http://192.168.122.1:5173','http://10.11.2.10:5173', 'http://10.12.12.2:5173'];

	//await fastify.register(cors, { origin: 'http://localhost:5173', credentials: true}); // autoriser n'importe qui a appeler l'API de ce serveur

	await fastify.register(cors, { 
		origin: (origin, cb) => {
			if (!origin || allowedOrigin.includes(origin)) {
				cb(null, true);
			} else {
				cb(new Error(`Not allowed by CORS: ${origin}`));
			}
		}, 
		credentials: true
	}); // autoriser n'importe qui a appeler l'API de ce serveur

	fastify.get('/ping', async()=>{ return { msg: 'pong' }; });

	await fastify.listen({ port: 3000, host: '0.0.0.0' });
	console.log(`Server running on http://localhost:3000`);
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
				`INSERT INTO users (login, email, password, avatar_url) VALUES (?, ?, ?, ?)`,
				[login, email, hashedPassword, '/images/default_avatar.png'],
				function (err) {
					if (err) {
						if (DEBUG_MODE)
							console.log("Erreur SQL:", err.message);
						reject(err);
					} else resolve(this);
				}
			);
			updateUserRanks();
		});
		if (DEBUG_MODE)
			console.log("New user successfully added. ID =", result.lastID);
		reply.status(201).send({ success: true, message: "New user successfully added.", userId: result.lastID });
	} catch (err) {
		if (DEBUG_MODE)
			console.log("Erreur d'ajout d'un utilisateur:", err.stack);
		if (err.code === 'SQLITE_CONSTRAINT') {
			if (err.message.includes('UNIQUE constraint failed: users.login'))
				return reply.status(409).send({ success: false, message: "Login already used.", field: "login" });
			else if (err.message.includes('UNIQUE constraint failed: users.email'))
				return reply.status(409).send({ success: false, message: "Email already used.", field: "email" });
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

fastify.post('/deleteuser', async (request, reply)=>{
	const {login, email, password} = request.body;
	if (DEBUG_MODE)
		console.log("Donnees recues: ", request.body);
	if (!login || !email || !password)
		return reply.status(400).send({ success: false, message: "Login, email and/or password is missing"});

	try {
		const userToDelete = await new Promise((resolve, reject)=>{
			db.get(
				`SELECT password FROM users WHERE login = ? AND email = ?`,
				[login, email],
				(err, row)=>{
					if (err) {
						reject(err);
					} else {
						resolve(row);
					}
				}
			);
		});
		if (!userToDelete)
			return reply.status(404).send({ success: false, message: "User not found." });

		const isPasswordValid = await bcrypt.compare(password, userToDelete.password);
		if (!isPasswordValid)
			return reply.status(401).send({ success: false, message: "Invalid password." });

		await new Promise((resolve, reject)=>{
			db.run(
				`DELETE FROM users WHERE login = ? AND email = ?`,
				[login, email],
				function(err) {
					if (err) {
						reject(err);
					} else {
						resolve(this.changes);
					}
				}
			);
			updateUserRanks();
			reply.status(200).send({ success: true, message: "User successfully deleted." });
		});
	} catch (err) {
		if (DEBUG_MODE)
			console.log("Erreur d'ajout d'un utilisateur:", err.stack);
		reply.status(500).send({ success: false, message: "Server error: " + err.message });
	}
});

// verifier les identifiants:
function updateIsConnected(userId) {
	db.serialize(async()=>{
		try {
			await new Promise((resolve, reject) => {
				db.run(
					`UPDATE users SET connected = ? WHERE id = ?`,
					[1, userId],
					(err) => {
						if (err) {
							console.log("Erreur de mise a jour de connexion du joueur:", err);
							reject(err);
						} else {
							resolve();
						}
					}
				);
			});
		} catch (err) {
			console.log("updateIsConnected error:", err);
		}
	});
}

fastify.post('/login', async (request, reply)=>{
	const { email, password } = request.body;
	if (DEBUG_MODE) {
		console.log("****************************************");
		console.log(request.body);
		console.log("****************************************");
	}

	// Validation de base
	if (!email || !password) {
        return reply.status(400).send({ success: false, message: "Email and password are required." });
    }

	const user = await getUserByEmail(email);
	if (DEBUG_MODE)
		console.log("Utilisateur trouve: ", user);

	if (user) {
		if (DEBUG_MODE) {
			console.log("****************************************");
			console.log('user', user.password);
			console.log("****************************************");
		}
		const passwordMatch = await bcrypt.compare(password, user.password);

		if (passwordMatch === true) {
			
			if (DEBUG_MODE)
				console.log("User Ok");
			request.session.set('user', user);
			updateIsConnected(user.id);
			return reply.send({ success: true, user: user });
		} else {
			// Le mot de passe est incorrect
			if (DEBUG_MODE) console.log("Mot de passe incorrect pour l'utilisateur:", user.login);
			return reply.status(401).send({ 
				success: false, 
				message: "Invalid credentials.", 
				field: "password"
			});
		}
	} else {
		if (DEBUG_MODE) {
			console.log("****************************************");
			console.log("Wrong user");
			console.log("****************************************");
		}
		return reply.status(401).send({ success: false, message: "Invalid credentials.", field: "email"	});
	}
});

fastify.get('/me', async (req, rep) => {
	const userMe = req.session.get('user');
	if (!userMe) {
		return rep.send({ error: 'Disconnected'});
	}

	const user = await new Promise((resolve, reject)=>{
			db.get(
				`SELECT * FROM users WHERE login = ?`,
				[userMe.login],
				(err, row)=>{
					if (err) {
						reject(err);
					} else {
						resolve(row);
					}
				}
			);
		});

	return rep.send({ user });
});

// fastify.get('/me', async (req, rep) => {
// 	const user = req.session.get('user');
// 	if (!user) {
// 		return rep.send({ error: 'Disconnected'});
// 	}
// 	return rep.send({ user });
// });

function updateIsNotConnected(userId) {
	db.serialize(async()=>{
		try {
			await new Promise((resolve, reject) => {
				db.run(
					`UPDATE users SET connected = ? WHERE id = ?`,
					[0, userId],
					(err) => {
						if (err) {
							console.log("Erreur de mise a jour de connexion du joueur:", err);
							reject(err);
						} else {
							resolve();
						}
					}
				);
			});
		} catch (err) {
			console.log("updateIsNotConnected error:", err);
		}
	});
}

fastify.get('/logout', async (request, reply) => {
	const user = request.session.get('user');
	updateIsNotConnected(user.id);
	request.session.delete('user');
	reply.clearCookie('sessionId');
	reply.send({ message: 'Deconnexion réussie'});
// 	});
});

// fastify.get('/users/specificlogin', async (request, reply)=>{
// 	try {
// 		const row = await new Promise((resolve, reject)=>{
// 			db.all(
// 				`SELECT * FROM users WHERE connected = ?`, 1, (err, row)=>{
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

// afficher toutes les parties:
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

// afficher les parties qu'a joue un utilisateur particulier:
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

// maj du rang de classement des utilisateurs: appeler la fonction a chaque fin de partie
function updateUserRanks() {
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

// afficher le leaderboard:
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

// afficher les amis d'un utilisateur en particulier:
fastify.get('/friends/me', async (request, reply)=>{
	try {
		const {login_current} = request.query;
			if (!login_current)
		return reply.status(400).send({ error: "Missing login." });

		const friends = await new Promise((resolve, reject)=>{
			db.all(
				`SELECT DISTINCT
					u.login as name,
					u.avatar_url as avatar_src,
					(u.connected = 1) as isconnected
				FROM friends f
				JOIN users u ON (u.login = f.login2)
				WHERE f.login1 = ?`, 
				[login_current], 
				(err, friends)=>{
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

// afficher toutes les amities:
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

// Informations sur un utilisateur en particulier, pour l'affichage par connected_player_frame.vue
fastify.get('/users/specificlogin', async (request, reply)=>{
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

// envoyer tous les utilisateurs connectes:
fastify.get('/users/connected', async (request, reply) => {
	try {
		const	rows = await new Promise((resolve, reject) => {
			db.all(
				`SELECT * FROM users WHERE connected = 1`,
				(err, row) => {
					if (err) reject(err);
					else resolve(row);
				}
			);
		});
		if (!rows)
			return reply.status(404).send({ error: "No user connected"})
		reply.send(rows);
	} catch (err) {
		console.error("Error:", err);
		reply.status(500).send({ error: err.message });
	}
})
