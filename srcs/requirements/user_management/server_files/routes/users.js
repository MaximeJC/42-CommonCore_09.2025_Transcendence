import bcrypt from 'bcrypt';
import validator from 'validator';
import { pipeline } from 'stream/promises';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { updateIsConnected, updateIsNotConnected } from '../services/userConnectionStatus.js';
import { updateUserRanks } from '../services/gameService.js';
import { notifyAllsocket } from '../websocket/handlers.js';

export default async function userRoutes(fastify, options) {
	const { db, getUserByEmail, getUserByLogin, userSocketMap, DEBUG_MODE } = options.deps;
	const __filename = fileURLToPath(import.meta.url);
	const __dirname = dirname(__filename);

	// Ajouter un nouvel utilisateur
	fastify.post('/users', async (request, reply) => {
		const { login, email, password } = request.body;

		if (!login || !email || !password) {
			return reply.status(400).send({ success: false, message: "Login, email ou mot de passe manquant." });
		}

		const cleanLogin = validator.escape(validator.trim(login));
		const cleanEmail = validator.escape(validator.trim(email));
		const cleanPassword = validator.escape(password);
		const hashedPassword = await bcrypt.hash(cleanPassword, 10);

		try {
			const result = await new Promise((resolve, reject) => {
				db.run(
					`INSERT INTO users (login, email, password, avatar_url) VALUES (?, ?, ?, ?)`,
					[cleanLogin, cleanEmail, hashedPassword, '/public/images/default_avatar.png'],
					function (err) {
						if (err) reject(err);
						else resolve(this);
					}
				);
			});

			await updateUserRanks(db);
			notifyAllsocket('leaderboard_update', `Nouveau joueur`);
			reply.status(201).send({ success: true, message: "Nouvel utilisateur ajoute avec succes.", userId: result.lastID });

		} catch (err) {
			if (DEBUG_MODE) {
				console.log("Erreur d'ajout d'utilisateur:", err.message);
			}
			if (err.code === 'SQLITE_CONSTRAINT') {
				if (err.message.includes('users.login'))
					return reply.status(409).send({ success: false, message: "Ce login est deja utilise.", field: "login" });
				else if (err.message.includes('users.email'))
					return reply.status(409).send({ success: false, message: "Cet email est deja utilise.", field: "email" });
			}
			reply.status(500).send({ success: false, message: "Erreur serveur: " + err.message });
		}
	});

	// Afficher tous les utilisateurs (pour debug principalement)
	fastify.get('/users', async (request, reply) => {
		try {
			const rows = await new Promise((resolve, reject) => {
				db.all(`SELECT id, login, email, connected, rank FROM users`, [], (err, rows) => {
					if (err) reject(err);
					else resolve(rows);
				});
			});
			reply.send(rows);
		} catch (err) {
			reply.status(500).send({ error: err.message });
		}
	});

	// Connexion d'un utilisateur
	fastify.post('/login', async (request, reply) => {
		const { email, password } = request.body;
		if (!email || !password) {
			return reply.status(400).send({ success: false, message: "Email et mot de passe requis." });
		}

		const cleanEmail = validator.escape(validator.trim(email));
		const user = await getUserByEmail(cleanEmail);

		if (user && await bcrypt.compare(password, user.password)) {
			request.session.set('user', user);
			updateIsConnected(db, user.id);
			return reply.send({ success: true, user: user });
		} else {
			return reply.status(401).send({ success: false, message: "Identifiants invalides." });
		}
	});

	// Recuperer les informations de l'utilisateur connecte
	fastify.get('/me', async (request, reply) => {
		const userSession = request.session.get('user');
		if (!userSession) {
			return reply.send({ error: 'Non connecte' });
		}

		// Re-fetch pour avoir les donnees a jour
		const user = await new Promise((resolve, reject) => {
			db.get(`SELECT * FROM users WHERE id = ?`, [userSession.id], (err, row) => {
				if (err) reject(err);
				else resolve(row);
			});
		});

		if (user) {
			return reply.send({ user });
		} else {
			return reply.status(404).send({ error: 'Utilisateur non trouve' });
		}
	});

	// Deconnexion
	fastify.get('/logout', async (request, reply) => {
		const user = request.session.get('user');
		if (user) {
			updateIsNotConnected(db, user.id);
		}
		request.session.delete();
		reply.clearCookie('sessionId');
		reply.send({ message: 'Deconnexion reussie' });
	});

	// Mettre a jour l'avatar
	fastify.post('/upload-avatar', async (request, reply) => {
		const user = request.session.get('user');
		if (!user || !user.id) {
			return reply.status(401).send({ error: 'Utilisateur non connecte' });
		}
		
		const data = await request.file();
		if (!data) {
			return reply.status(400).send({ error: 'Aucun fichier envoye' });
		}

		const filename = `${user.id}-${data.filename}`;
		const saveTo = path.join(__dirname, '..', 'uploads', filename);

		try {
			// Supprimer l'ancien avatar
			const filesInDir = fs.readdirSync(path.join(__dirname, '..', 'uploads'));
			for (const file of filesInDir) {
				if (file.startsWith(`${user.id}-`)) {
					fs.unlinkSync(path.join(__dirname, '..', 'uploads', file));
				}
			}
			
			// Sauvegarder le nouveau
			await pipeline(data.file, fs.createWriteStream(saveTo));
			const relativePath = `/uploads/${filename}`;
			
			// Mettre a jour la base de donnees
			await new Promise((resolve, reject) => {
				db.run(`UPDATE users SET avatar_url = ? WHERE id = ?`, [relativePath, user.id], (err) => {
					if (err) reject(err);
					else resolve();
				});
			});
			
			reply.send({ message: 'Avatar mis a jour', avatar_url: relativePath });

		} catch (error) {
			console.error("Erreur interne dans /upload-avatar:", error);
			reply.status(500).send({ message: 'Erreur interne du serveur' });
		}
	});
	
	// Informations sur un utilisateur specifique via son login
	fastify.get('/users/specificlogin', async (request, reply) => {
		const { login } = request.query;
		if (!login) {
			return reply.status(400).send({ error: "Login manquant" });
		}
		try {
			const user = await getUserByLogin(login);
			if (!user) {
				return reply.status(404).send({ error: "Utilisateur non trouve" });
			}
			const publicInfo = {
				login: user.login,
				avatar_url: user.avatar_url,
				nb_games: user.nb_games,
				nb_won_games: user.nb_won_games,
				connected: user.connected,
				rank: user.rank
			};
			reply.send(publicInfo);
		} catch (err) {
			reply.status(500).send({ error: err.message });
		}
	});
	
	// Changer l'email de l'utilisateur connecte
	fastify.post('/users/change-email', async (request, reply) => {
		const user = request.session.get('user');
		if (!user) {
			return reply.status(401).send({ success: false, message: "Non connecte" });
		}
		
		const { email } = request.body;
		if (!email) {
			return reply.status(400).send({ success: false, message: "Email manquant" });
		}
		
		const cleanEmail = validator.escape(validator.trim(email));

		try {
			await new Promise((resolve, reject) => {
				db.run(`UPDATE users SET email = ? WHERE id = ?`, [cleanEmail, user.id], function (err) {
					if (err) reject(err);
					else resolve(this);
				});
			});
			reply.status(200).send({ success: true, message: "Email change avec succes" });
		} catch (err) {
			if (err.code === 'SQLITE_CONSTRAINT') {
				return reply.status(409).send({ success: false, message: "Email deja utilise.", field: "email" });
			}
			reply.status(500).send({ success: false, message: "Erreur serveur." });
		}
	});

	// Changer le login de l'utilisateur connecte
	fastify.post('/users/change-login', async (request, reply) => {
		const user = request.session.get('user');
		if (!user) {
			return reply.status(401).send({ success: false, message: "Non connecte" });
		}

		const { login } = request.body;
		if (!login) {
			return reply.status(400).send({ success: false, message: "Login manquant" });
		}
		
		const cleanLogin = validator.escape(validator.trim(login));
		
		try {
			await new Promise((resolve, reject) => {
				db.run(`UPDATE users SET login = ? WHERE id = ?`, [cleanLogin, user.id], function (err) {
					if (err) reject(err);
					else resolve(this);
				});
			});

			// Mettre a jour la map de sockets et la session
			const targetSocket = userSocketMap.get(user.login);
			if (targetSocket) {
				userSocketMap.delete(user.login);
				userSocketMap.set(cleanLogin, targetSocket);
			}
			const updatedUser = await getUserByLogin(cleanLogin);
			request.session.set('user', updatedUser);

			reply.status(200).send({ success: true, message: "Login change avec succes" });
		} catch (err) {
			if (err.code === 'SQLITE_CONSTRAINT') {
				return reply.status(409).send({ success: false, message: "Login deja utilise.", field: "login" });
			}
			reply.status(500).send({ success: false, message: "Erreur serveur." });
		}
	});

	// Changer le mot de passe
	fastify.post('/users/change-password', async (request, reply) => {
		// TODO : ajouter une verification de l'ancien mot de pass par securite
		const user = request.session.get('user');
		if (!user) {
			return reply.status(401).send({ success: false, message: "Non connecte" });
		}
		
		const { password } = request.body;
		if (!password) {
			return reply.status(400).send({ success: false, message: "Mot de passe manquant" });
		}

		const hashedPassword = await bcrypt.hash(password, 10);

		try {
			await new Promise((resolve, reject) => {
				db.run(`UPDATE users SET password = ? WHERE id = ?`, [hashedPassword, user.id], function (err) {
					if (err) reject(err);
					else resolve(this);
				});
			});
			reply.status(200).send({ success: true, message: "Mot de passe change avec succes" });
		} catch (err) {
			reply.status(500).send({ success: false, message: "Erreur serveur." });
		}
	});
}