const DEBUG_MODE = true;

import Fastify from 'fastify'; // importer fastify
import cors from '@fastify/cors'; // permettra connexion au front
import dbModule from './db.js' // importer cette fonction du fichier db.js
import bcrypt from 'bcrypt';
import fastifyCookie from '@fastify/cookie';
import fastifySecureSession from '@fastify/secure-session';
import fastifyMultipart from '@fastify/multipart';
import fastifyStatic from '@fastify/static';
import validator from 'validator';
import { dirname } from 'path';

import crypto from 'crypto';
import { pipeline } from 'stream/promises'; // Pour gerer les flux proprement
import fs from 'fs'; // Pour creer le flux d'ecriture
import path from 'path';
import { fileURLToPath } from 'url';
import fastifyWebsocket from '@fastify/websocket';

const fastify = Fastify({logger: true});
//-----------------------------------------------------

// structure pour suivre les utilisateurs connectes
// Cle: login, Valeur: socket.id
const userSocketMap = new Map();
//------------------------------------------------------
const { db, getUserByEmail } = dbModule;

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

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);
// const newdir = path.join(__dirname, '../..', 'front_end/server_files/'); // revoir le bon chemin ou trasfert vers docker 

const UPLOADS_BASE_PATH = '/app/server_files';

await fastify.register(fastifyMultipart);
await fastify.register(fastifyStatic, {
	root: path.join(UPLOADS_BASE_PATH, 'public', 'uploads'),
	prefix: '/public/uploads/',
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
		const saveTo = path.join(UPLOADS_BASE_PATH, 'public', 'uploads', filename);

		try {
			const uploadDir = path.join(UPLOADS_BASE_PATH, 'public', 'uploads');
			const fileToDelete = fs.readdirSync(uploadDir);
			console.log("fileToDelete:", fileToDelete);
			for (const file of fileToDelete) {
				console.log("file:", file);
				if (file.startsWith(`${user.login}-`)) {
					fs.unlinkSync(path.join(uploadDir, file));
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

		const relativePath = `/public/uploads/${filename}`;

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
	const allowedOrigins = [
		'http://localhost:5173',
		'http://127.0.0.1:5173',
		'http://localhost:5000',
		'http://127.0.0.1:5000',
	];

	await fastify.register(cors, {
		origin: (origin, cb) => {
			if (!origin) {
				return cb(null, true);
			}
			if (allowedOrigins.includes(origin)) {
				return cb(null, true);
			}

			if (origin.startsWith('http://10.') || origin.startsWith('http://192.') ||
				origin.startsWith('http://172.') ||  origin.startsWith('https://172.') ||
				origin.startsWith('https://10.') || origin.startsWith('https://192.') ||
				origin.startsWith('http://127.') || origin.startsWith('http://localhost') ||
				origin.startsWith('https://127.') || origin.startsWith('https://localhost'))
			{
				return cb(null, true);
			}
			cb(new Error(`Not allowed by CORS: ${origin}`));
		},
		credentials: true
	});

	await fastify.register(fastifyWebsocket, {
		options: {
			origin: (origin, callback) => {
				if (!origin || /localhost/.test(origin)) {
					callback(null, true);
				} else {
					callback(new Error('Origin not allowed'), false);
				}
			}
		}
	});

	fastify.get('/ping', async()=>{ return { msg: 'pong' }; });	
	fastify.get('/ws', { websocket: true }, (connection, req) => {
    
		console.log("--- Handler WebSocket demarre pour une nouvelle connexion. ---");
		try {
			let currentUserLogin = null;
			
			console.log(`Client connecte avec succes ! Attachement des listeners...`);
			connection.on('message', (message) => {
				try {
					const data = JSON.parse(message.toString());

					if (data.event === 'register' && data.payload) {
						currentUserLogin = data.payload;
							try {
						
							db.run(
								`UPDATE users SET connected = ? WHERE login = ?`,
								[1, currentUserLogin],
								(err) => {
									if (err)
										console.log("Erreur de mise a jour de connexion du joueur:", err);
								}
							);
							notifyAllsocket('friend_update', `Ami connecte`);							
							
						} catch (err) {
							console.log("WebSocket connecte error:", err);
						}
						console.log(`WebSocket enregistre pour l'utilisateur ${currentUserLogin}`);
						userSocketMap.set(currentUserLogin, connection);
					}
	
				} catch (error) {
					console.error('Erreur de message WebSocket:', error);
				}
			});

			connection.on('close', () => {
				console.log(`WebSocket deconnecte (evenement 'close' reçu).`);
				if (currentUserLogin) {
						db.serialize(async()=>{
						try {
							
							db.run(
								`UPDATE users SET connected = ? WHERE login = ?`,
								[0, currentUserLogin],
								(err) => {
									if (err)
										console.log("Erreur de mise a jour de connexion du joueur:", err);
								}
							);
							notifyAllsocket('friend_update', `Ami deconnecte`);	
						} catch (err) {
							console.log("WebSocket deconnecte error:", err);
						}
					});
					userSocketMap.delete(currentUserLogin);
					console.log(`Entree pour ${currentUserLogin} supprimee.`);
				}
			});
			
			connection.on('error', (error) => {
				console.error("Erreur explicite reçue sur le socket", error);
			});

			console.log("Listeners attaches avec succes. La connexion reste ouverte.");
	
		} catch (err) {
			console.error("ERREUR FATALE LORS DE L'INITIALISATION DU HANDLER WEBSOCKET", err);
		}
	});
		await fastify.listen({ port: 3000, host: '0.0.0.0' });
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
	let cleanLogin, cleanEmail, cleanPassword;

	cleanLogin = validator.trim(login);
	cleanLogin = validator.escape(cleanLogin);

	cleanEmail = validator.trim(email);
	cleanEmail = validator.escape(cleanEmail);

	cleanPassword = validator.escape(password);

	const	hashedPassword = await bcrypt.hash(cleanPassword, 10);

	try {
		const result = await new Promise((resolve, reject)=>{
			db.run(
				`INSERT INTO users (login, email, password, avatar_url) VALUES (?, ?, ?, ?)`,
				[cleanLogin, cleanEmail, hashedPassword, '/images/default_avatar.png'],
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
		notifyAllsocket('leaderboard_update', `Nouveau joueur`);
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

function notifyAllsocket(eventSend, messageSend)
{
	for (const [login, connection] of userSocketMap.entries()) {
		console.log(`Traitement pour l'utilisateur ${login} avec le socket ID ${connection.id}`);
		const targetSocket = userSocketMap.get(login);
		if (targetSocket && targetSocket.readyState === 1) {			
			const notification = {
				event: eventSend,
				payload: {						
					message: messageSend
				}
			};
			targetSocket.send(JSON.stringify(notification));
			}		
		}
}

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

	let cleanEmail, cleanPassword;

	cleanEmail = validator.trim(email);
	cleanEmail = validator.escape(cleanEmail);

	cleanPassword = validator.escape(password);

	const user = await getUserByEmail(cleanEmail);
	if (DEBUG_MODE)
		console.log("Utilisateur trouve: ", user);

	if (user) {
		if (DEBUG_MODE) {
			console.log("****************************************");
			console.log('user', user.password);
			console.log("****************************************");
		}
		const passwordMatch = await bcrypt.compare(cleanPassword, user.password);

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
	reply.send({ message: 'Deconnexion reussie'});
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

	let cleanLogin2;

	cleanLogin2 = validator.trim(login2);
	cleanLogin2 = validator.escape(cleanLogin2);

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
				`SELECT 1 FROM users WHERE login = ?`, [cleanLogin2], (err, row)=>{
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
			console.log("Login2 a bien ete trouve dans la base de donnees: ", {cleanLogin2});

		const relationExists = await new Promise((resolve, reject)=>{
			db.get(
				`SELECT 1 FROM friends WHERE (login1 = ? AND login2 = ?) OR (login2 = ? AND login1 = ?)`,
				[login1, cleanLogin2, cleanLogin2, login1],
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
				[login1, cleanLogin2],
				(err)=>{ if (err) reject(err); }
			);
			db.run(
				`INSERT INTO friends (login1, login2) VALUES (?,?)`,
				[cleanLogin2, login1],
				(err)=>{
					if (err) reject(err);
					else resolve(this);
				}
			);
		});

		// --- WEBSOCKET ---
		// On cherche le socket de l'utilisateur qui a ete ajoute (login2)
		const targetSocket = userSocketMap.get(cleanLogin2);

		if (targetSocket && targetSocket.readyState === 1) {
			console.log(`Utilisateur ${cleanLogin2} trouve, envoi de la maj.`);
			
			const notification = {
				event: 'friend_update',
				payload: {
					message: `Vous avez un nouvel ami : ${login1}`
				}
			};
			
			targetSocket.send(JSON.stringify(notification));
		} else {
			console.log(`L'utilisateur ${cleanLogin2} n'est pas connecte via WebSocket.`);
		}
		// --- FIN SOCKET ---

		reply.send({message: "Friendship saved successfully."});
	} catch (err) {
		if (DEBUG_MODE)
			console.log("Erreur d'ajout d'ami.\n");
		reply.status(500).send({error: err.message});
	}
});

fastify.post('/friends/invite', async (request, reply)=>{
	const {login1, login2} = request.body;
	if (DEBUG_MODE)
		console.log("Logins recus /friends/invite: ", {login1, login2});

	try {
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


		// --- WEBSOCKET ---
		// On cherche le socket de l'utilisateur qui a ete invite (login2)
		const targetSocket = userSocketMap.get(login2);

		if (targetSocket && targetSocket.readyState === 1) {
			console.log(`Utilisateur ${login2} trouve, envoi de l'invite'.`);
			
			const notification = {
				event: 'friend_invite',
				payload: {
					message: `Vous avez une invite : ${login1}`,
					loginInviteur: `${login1}`
				}
			};
			
			targetSocket.send(JSON.stringify(notification));
		} else {
			console.log(`L'utilisateur ${login2} n'est pas connecte via WebSocket.`);
		}
		// --- FIN SOCKET ---

		reply.send({message: "Invite send successfully."});
	} catch (err) {
		if (DEBUG_MODE)
			console.error("Erreur d'invite ami.\n", err);
		reply.status(500).send({error: err.message});
	}
});

fastify.post('/friends/invite_cancel', async (request, reply)=>{
	const {login1, login2} = request.body;
	if (DEBUG_MODE)
		console.log("Logins annul /friends/invite_cancel: ", {login1, login2});

	try {
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


		// --- WEBSOCKET ---
		const targetSocket = userSocketMap.get(login2);

		if (targetSocket && targetSocket.readyState === 1) {
			console.log(`Utilisateur ${login2} trouve, envoi de l'annulation d'invite'.`);
			
			const notification = {
				event: 'friend_invite_cancel',
				payload: {
					message: `Vous avez une invite annule : ${login1}`,
					loginInviteur: `${login1}`
				}
			};
			
			targetSocket.send(JSON.stringify(notification));
		} else {
			console.log(`L'utilisateur ${login2} n'est pas connecte via WebSocket.`);
		}
		// --- FIN SOCKET ---

		reply.send({message: "Invite cancel successfully."});
	} catch (err) {
		if (DEBUG_MODE)
			console.error("Erreur d'annulation d'invite ami.\n", err);
		reply.status(500).send({error: err.message});
	}
});

fastify.post('/friends/invite_decline', async (request, reply)=>{
	const {login1, login2} = request.body;
	if (DEBUG_MODE)
		console.log("Logins annule /friends/invite_decline: ", {login1, login2});

	try {
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


		// --- WEBSOCKET ---
		const targetSocket = userSocketMap.get(login2);

		if (targetSocket && targetSocket.readyState === 1) {
			console.log(`Utilisateur ${login2} trouve, envoi de refus d'invite'.`);
			
			const notification = {
				event: 'friend_invite_decline',
				payload: {
					message: `Vous avez une invite refuse : ${login1}`,
					loginInviteur: `${login1}`
				}
			};
			
			targetSocket.send(JSON.stringify(notification));
		} else {
			console.log(`L'utilisateur ${login2} n'est pas connecte via WebSocket.`);
		}
		// --- FIN SOCKET ---

		reply.send({message: "Invite decline successfully."});
	} catch (err) {
		if (DEBUG_MODE)
			console.error("Erreur de refus d'invite ami.\n", err);
		reply.status(500).send({error: err.message});
	}
});

fastify.post('/friends/invite_accept', async (request, reply)=>{
	const {login1, login2} = request.body;
	if (DEBUG_MODE)
		console.log("Logins annul /friends/invite_accept: ", {login1, login2});

	try {
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


		// --- WEBSOCKET ---
		const targetSocket = userSocketMap.get(login2);

		if (targetSocket && targetSocket.readyState === 1) {
			console.log(`Utilisateur ${login2} trouve, envoi de l'acceptation d'invite'.`);
			
			const notification = {
				event: 'friend_invite_accepted',
				payload: {
					message: `Vous avez une invite accepte : ${login1}`,
					loginInviteur: `${login1}`
				}
			};
			
			targetSocket.send(JSON.stringify(notification));
		} else {
			console.log(`L'utilisateur ${login2} n'est pas connecte via WebSocket.`);
		}
		// --- FIN SOCKET ---

		reply.send({message: "Invite accepted successfully."});
	} catch (err) {
		if (DEBUG_MODE)
			console.error("Erreur d'acceptation d'invite ami.\n", err);
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

//check si ami
fastify.post('/friends/check', async (request, reply)=>{
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

		
		// --- WEBSOCKET ---
		// On cherche le socket de l'utilisateur qui a ete ajoute (login2)
		const targetSocket = userSocketMap.get(login2);

		if (targetSocket && targetSocket.readyState === 1) {
			console.log(`Utilisateur ${login2} trouve.`);
			
			const notification = {
				event: 'friend_check',
				payload: {
					message: `Vous etes ami : ${login1}`
				}
			};
			
			targetSocket.send(JSON.stringify(notification));
		} else {
			console.log(`L'utilisateur ${login2} n'est pas connecte via WebSocket.`);
		}
		// --- FIN SOCKET ---
		reply.send({message: "Friendship successfully check."});
	} catch (err) {
		if (DEBUG_MODE)
			console.log(`Erreur de check d'ami! : ${err.message}\n`);
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
		// --- WEBSOCKET ---
		// On cherche le socket de l'utilisateur qui a ete ajoute (login2)
		const targetSocket = userSocketMap.get(login2);

		if (targetSocket && targetSocket.readyState === 1) {
			console.log(`Utilisateur ${login2} trouve, envoi de la maj.`);
			
			const notification = {
				event: 'friend_update',
				payload: {
					message: `Vous avez supprime un ami : ${login1}`
				}
			};
			
			targetSocket.send(JSON.stringify(notification));
		} else {
			console.log(`L'utilisateur ${login2} n'est pas connecte via WebSocket.`);
		}
		// --- FIN SOCKET ---
		reply.send({message: "Friendship successfully deleted."});
	} catch (err) {
		if (DEBUG_MODE)
			console.log(`Erreur de suppression d'ami! : ${err.message}\n`);
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
				`SELECT login, avatar_url, nb_games, nb_won_games, connected, rank FROM users WHERE login = ?`,
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

fastify.post('/users/change-email', async (request, reply)=>{
	const {email} = request.body;
	if (DEBUG_MODE)
		console.log("Donnees recues: ", request.body);
	if (!email) {
		return reply.status(400).send({ success: false, message: "email is missing" });
	}
	let cleanEmail;

	cleanEmail = validator.trim(email);
	cleanEmail = validator.escape(cleanEmail);

	const user = request.session.get('user');

	try {
		const result = await new Promise((resolve, reject)=>{
			db.run(
				`UPDATE users SET email = ? WHERE id = ?`,
				[cleanEmail, user.id],
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
			console.log("New email successfully changed. ID =", result.lastID);
		reply.status(201).send({ success: true, message: "New email successfully changed", userId: result.lastID });
	} catch (err) {
		if (DEBUG_MODE)
			console.log("Erreur de changement d'email", err.stack);
		if (err.code === 'SQLITE_CONSTRAINT') {
			if (err.message.includes('UNIQUE constraint failed: users.email'))
				return reply.status(409).send({ success: false, message: "Email already used.", field: "email" });
		}
		reply.status(500).send({ success: false, message: "Server error: " + err.message });
	}
});

fastify.post('/users/change-login', async (request, reply)=>{
	const {login} = request.body;
	if (DEBUG_MODE)
		console.log("Donnees recues: ", request.body);
	if (!login) {
		return reply.status(400).send({ success: false, message: "login is missing" });
	}
	let cleanLogin;

	cleanLogin = validator.trim(login);
	cleanLogin = validator.escape(cleanLogin);

	const user = request.session.get('user');

	try {
		const result = await new Promise((resolve, reject)=>{
			db.serialize(()=>{
				db.run(`BEGIN TRANSACTION`);

				// table users:
				db.run(
					`UPDATE users SET login = ? WHERE id = ?`,
					[cleanLogin, user.id],
					function (err) {
						if (err) {
							if (DEBUG_MODE)
								console.log("Erreur SQL change login: users:", err.message);
							db.run(`ROLLBACK`);
							reject(err);
						} else {
							db.run(
								`UPDATE games SET login_winner = ? WHERE login_winner = ?`,
								[cleanLogin, user.login],
								function (err) {
									if (err) {
										if (DEBUG_MODE)
											console.log("Erreur SQL change login: games, winner:", err.message);
										db.run(`ROLLBACK`);
										reject(err);
									} else {
										db.run(
											`UPDATE games SET login_loser = ? WHERE login_loser = ?`,
											[cleanLogin, user.login],
											function (err) {
												if (err) {
													if (DEBUG_MODE)
														console.log("Erreur SQL change login: games, loser:", err.message);
													db.run(`ROLLBACK`);
													reject(err);
												} else {
													db.run(
														`UPDATE friends SET login1 = ? WHERE login1 = ?`,
														[cleanLogin, user.login],
														function (err) {
															if (err) {
																if (DEBUG_MODE)
																	console.log("Erreur SQL change login: friends, login1:", err.message);
																db.run(`ROLLBACK`);
																reject(err);
															} else {
																db.run(
																	`UPDATE friends SET login2 = ? WHERE login2 = ?`,
																	[cleanLogin, user.login],
																	function (err) {
																		if (err) {
																			if (DEBUG_MODE)
																				console.log("Erreur SQL change login: friends, login2:", err.message);
																			db.run(`ROLLBACK`);
																			reject(err);
																		} else {
																			db.run(`commit`, function (err) {
																				if (err) {
																					if (DEBUG_MODE)
																						console.log("Erreur SQL Commit:", err.message);
																					reject(err);
																				} else {
																					resolve(this);
																				}
																			});
																		}
																	}
																);
															}
														}
													);
												}
											}
										);
									}
								}
							);
						}
					}
				);
			});
		});
		if (DEBUG_MODE)
			console.log("New login successfully changed. ID =", result.lastID);
		const targetSocket = userSocketMap.get(user.login);
		if (targetSocket)
		{
			userSocketMap.delete(user.login)
			userSocketMap.set(cleanLogin, targetSocket);
			 const updatedUser = await new Promise((resolve, reject) => {
				db.get(`SELECT * FROM users WHERE login = ?`, [cleanLogin], (err, row) => {
					if (err) reject(err);
					else resolve(row);
				});
			});
			request.session.set('user', updatedUser);
		}
		reply.status(201).send({ success: true, message: "New login successfully changed", userId: result.lastID });
	} catch (err) {
		if (DEBUG_MODE)
			console.log("Erreur de changement de login", err.stack);
		if (err.code === 'SQLITE_CONSTRAINT') {
			if (err.message.includes('UNIQUE constraint failed: users.login'))
				return reply.status(409).send({ success: false, message: "Login already used.", field: "login" });
		}
		reply.status(500).send({ success: false, message: "Server error: " + err.message });
	}
});

fastify.post('/users/change-password', async (request, reply)=>{
	const {id, password} = request.body;
	if (DEBUG_MODE)
		console.log("Donnees recues: ", request.body);
	if (!password) {
		return reply.status(400).send({ success: false, message: "password is missing" });
	}
	let cleanPassword;

	cleanPassword = validator.escape(password);

	const	hashedPassword = await bcrypt.hash(cleanPassword, 10);

	// const user = request.session.get('user');
	console.log("id: ", id);

	try {
		const result = await new Promise((resolve, reject)=>{
			db.run(
				`UPDATE users SET password = ? WHERE id = ?`,
				[hashedPassword, id],
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
			console.log("New password successfully changed. ID =", result.lastID);
		reply.status(201).send({ success: true, message: "New password successfully changed", userId: result.lastID });
	} catch (err) {
		if (DEBUG_MODE)
			console.log("Erreur de changement de password", err.stack);
		reply.status(500).send({ success: false, message: "Server error: " + err.message });
	}
});
