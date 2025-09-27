/* Routes de gestion des utilisateurs */

import bcrypt from 'bcrypt';
import dbModule from './../db.js'
import validator from 'validator';
import { notifyAllsocket } from '../websocket/handlers.js';
import { updateUserRanks } from '../services/gameService.js';
import { userSocketMap } from '../websocket/handlers.js';
import { updateIsConnected, updateIsNotConnected } from '../services/userConnectionStatus.js'

const { db, getUserByEmail } = dbModule;

export default async function userRoutes(fastify) {
// connexion
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

// deconnexion
	fastify.get('/logout', async (request, reply) => {
		const user = request.session.get('user');
		updateIsNotConnected(user.id);
		request.session.delete('user');
		reply.clearCookie('sessionId');
		reply.send({ message: 'Deconnexion reussie'});
	});

// uploader un avatar
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
			const saveTo = path.join(__dirname, 'uploads', filename);

			try {

				const fileToDelete = fs.readdirSync(`${__dirname}/uploads`);
				console.log("fileToDelete:", fileToDelete);
				for (const file of fileToDelete) {
					console.log("file:", file);
					if (file.startsWith(`${user.login}-`)) {
						fs.unlinkSync(path.join(`${__dirname}/uploads`, file));
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

// changer d'adresse email
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

// changer de login
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

// changer de mdp
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

// infos de l'utilisateur connecte
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

// infos utilisateur specifique
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

// lister tous les utilisateurs connectes
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

// lister tous les utilisateurs
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

// ajouter un utilisateur
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

// supprimer un utilisateur
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

	done();
}
