/* Routes de gestion des amis et des invitations a jouer */

import { userSocketMap } from '../websocket/handlers.js';

export default async function friendRoutes(fastify){
// lister toutes les amities
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

// ajouter un ami
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

// supprimer un ami
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

// inviter un ami a jouer
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
				console.log(`L'utilisateur ${cleanLogin2} n'est pas connecte via WebSocket.`);
			}
			// --- FIN SOCKET ---

			reply.send({message: "Invite send successfully."});
		} catch (err) {
			if (DEBUG_MODE)
				console.error("Erreur d'invite ami.\n", err);
			reply.status(500).send({error: err.message});
		}
	});

// annuler une invitation a jouer
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
				console.log(`L'utilisateur ${cleanLogin2} n'est pas connecte via WebSocket.`);
			}
			// --- FIN SOCKET ---

			reply.send({message: "Invite cancel successfully."});
		} catch (err) {
			if (DEBUG_MODE)
				console.error("Erreur d'annulation d'invite ami.\n", err);
			reply.status(500).send({error: err.message});
		}
	});

// accepter une invitation a jouer
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
				console.log(`L'utilisateur ${cleanLogin2} n'est pas connecte via WebSocket.`);
			}
			// --- FIN SOCKET ---

			reply.send({message: "Invite accepted successfully."});
		} catch (err) {
			if (DEBUG_MODE)
				console.error("Erreur d'acceptation d'invite ami.\n", err);
			reply.status(500).send({error: err.message});
		}
	});

// refuser une invitation a jouer
	fastify.post('/friends/invite_decline', async (request, reply)=>{
		const {login1, login2} = request.body;
		if (DEBUG_MODE)
			console.log("Logins annul /friends/invite_decline: ", {login1, login2});

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
				console.log(`L'utilisateur ${cleanLogin2} n'est pas connecte via WebSocket.`);
			}
			// --- FIN SOCKET ---

			reply.send({message: "Invite decline successfully."});
		} catch (err) {
			if (DEBUG_MODE)
				console.error("Erreur de refus d'invite ami.\n", err);
			reply.status(500).send({error: err.message});
		}
	});

// lister les amis d'un utilisateur specifique
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

// verifier si 2 utilisateurs sont amis
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

	done();
}
