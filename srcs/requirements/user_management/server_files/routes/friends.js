import validator from 'validator';
import { notifyUser } from '../websocket/handlers.js';

export default async function friendRoutes(fastify, options) {
	const { db, getUserByLogin, DEBUG_MODE } = options.deps;

	// Ajouter un ami
	fastify.post('/friends', async (request, reply) => {
		const { login1, login2 } = request.body;

		if (DEBUG_MODE) {
			console.log("Logins recus pour ajout d'ami: ", { login1, login2 });
		}

		if (!login1 || !login2) {
			return reply.status(400).send({ error: "Les deux logins sont requis." });
		}
		
		// On ne peut pas s'ajouter soi-meme
		if (login1 === login2) {
			return reply.status(400).send({ error: "Vous ne pouvez pas vous ajouter vous-meme comme ami." });
		}

		let cleanLogin2 = validator.trim(login2);
		cleanLogin2 = validator.escape(cleanLogin2);

		try {
			// Recuperer les utilisateurs complets pour obtenir leurs IDs
			const user_1 = await getUserByLogin(login1);
			const user_2 = await getUserByLogin(cleanLogin2);

			// Verifier si les utilisateurs existent
			if (!user_1) {
				return reply.send({ error: `L'utilisateur ${login1} n'a pas ete trouve.` });
			}
			if (!user_2) {
				return reply.send({ error: `L'utilisateur ${cleanLogin2} n'a pas ete trouve.` });
			}

			const id_1 = user_1.id;
			const id_2 = user_2.id;
			
			// Verifier si la relation d'amitie existe deja en utilisant les IDs
			const relationExists = await new Promise((resolve, reject) => {
				db.get(
					`SELECT 1 FROM friends WHERE (id_1 = ? AND id_2 = ?)`,
					[id_1, id_2],
					(err, row) => {
						if (err) reject(err);
						else resolve(!!row);
					}
				);
			});

			if (relationExists) {
				return console.log("Cette relation d'amitie existe deja.");
			}

			// Inserer la relation d'amitie dans les deux sens
			await new Promise((resolve, reject) => {
				db.serialize(() => {
					const stmt = db.prepare(`INSERT INTO friends (id_1, id_2) VALUES (?, ?)`);
					stmt.run(id_1, id_2);
					stmt.run(id_2, id_1);
					stmt.finalize((err) => {
						if (err) reject(err);
						else resolve();
					});
				});
			});

			// Notification WebSocket a l'utilisateur ajoute
			notifyUser(cleanLogin2, 'friend_update', {
				message: `Vous avez un nouvel ami : ${login1}`
			});

			reply.status(201).send({ message: "Relation d'amitie ajoutee avec succes." });

		} catch (err) {
			if (DEBUG_MODE) {
				console.log("Erreur lors de l'ajout d'ami:", err);
			}
			reply.status(500).send({ error: "Erreur serveur lors de l'ajout d'ami." });
		}
	});

	// Inviter un ami (cette route ne modifie pas la DB, elle envoie une notifi)
	fastify.post('/friends/invite', async (request, reply) => {
		const { login1, login2 } = request.body;
		if (DEBUG_MODE) {
			console.log("Logins recus pour l'invitation: ", { login1, login2 });
		}
		
		// Notification WebSocket a l'utilisateur invite
		notifyUser(login2, 'friend_invite', {
			message: `Vous avez recu une invitation d'ami de : ${login1}`,
			loginInviteur: login1
		});
		
		reply.send({ message: "Invitation envoyee avec succes." });
	});


	// Afficher les amis d'un utilisateur
	fastify.get('/friends/me', async (request, reply) => {
		const { login_current } = request.query;
		if (!login_current) {
			return reply.status(400).send({ error: "Le login de l'utilisateur est manquant." });
		}

		try {
			const currentUser = await getUserByLogin(login_current);
			if (!currentUser) {
				return reply.status(404).send({ error: "Utilisateur non trouve." });
			}
			const id_current = currentUser.id;

			const friends = await new Promise((resolve, reject) => {
				db.all(
					`SELECT
						u.login as name,
						u.id as id,
						u.avatar_url as avatar_src,
						(u.connected = 1) as isconnected
					FROM friends f
					JOIN users u ON u.id = f.id_2
					WHERE f.id_1 = ?`,
					[id_current],
					(err, rows) => {
						if (err) reject(err);
						else resolve(rows);
					}
				);
			});
			reply.send(friends);
		} catch (err) {
			if (DEBUG_MODE) {
				console.log("Erreur lors de l'affichage des amis:", err);
			}
			reply.status(500).send({ error: "Erreur serveur lors de la recuperation des amis." });
		}
	});

	//check si ami
	fastify.post('/friends/check', async (request, reply)=>{
		try {
			const {login1, login2} = request.body;

			const user1 = await getUserByLogin(login1);
			const user2 = await getUserByLogin(login2);

			if (!user1 || !user2) {
				return reply.status(400).send({message: "Friendship doesn't exist."});
			}

			const relationExists = await new Promise((resolve, reject)=>{
				db.get(
					`SELECT 1 FROM friends WHERE id_1 = ? AND id_2 = ?`,
					[user1.id, user2.id],
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
				return reply.send({message: "Friendship doesn't exist."});
			if (DEBUG_MODE)
				console.log("La relation existe bien.\n");

			notifyUser(login2, 'friend_check', {
				message: `Vous etes ami : ${user1.login}`
			});

			reply.send({message: "Friendship successfully check."});
		} catch (err) {
			if (DEBUG_MODE)
				console.log(`Erreur de check d'ami! : ${err.message}\n`);
			reply.status(500).send({error: err.message});
		}
	});

	// Supprimer un ami
	fastify.post('/friends/delete', async (request, reply) => {
		const { login1, login2 } = request.body;

		try {
			const user_1 = await getUserByLogin(login1);
			const user_2 = await getUserByLogin(login2);

			if (!user_1 || !user_2) {
				return reply.status(404).send({ message: "Un ou plusieurs utilisateurs non trouves." });
			}

			const id_1 = user_1.id;
			const id_2 = user_2.id;
			
			// Supprimer la relation dans les deux sens
			await new Promise((resolve, reject) => {
				db.run(
					`DELETE FROM friends WHERE (id_1 = ? AND id_2 = ?) OR (id_1 = ? AND id_2 = ?)`,
					[id_1, id_2, id_2, id_1],
					function(err) {
						if (err) reject(err);
						// 'this.changes' indique le nombre de lignes supprimees
						else if (this.changes === 0) reject(new Error("La relation d'amitie n'existe pas."));
						else resolve();
					}
				);
			});
			
			// Notification WebSocket a l'utilisateur supprime
			notifyUser(login2, 'friend_update', { message: `${login1} vous a retire de sa liste d'amis.` });

			reply.send({ message: "Relation d'amitie supprimee avec succes." });

		} catch (err) {
			if (DEBUG_MODE) {
				console.log(`Erreur de suppression d'ami: ${err.message}`);
			}
			// Gerer le cas ou la relation n'existe pas
			if (err.message.includes("n'existe pas")) {
				return reply.status(404).send({ error: err.message });
			}
			reply.status(500).send({ error: "Erreur serveur lors de la suppression d'ami." });
		}
	});

	fastify.post('/friends/invite_cancel', async (request, reply)=>{
		const {login1, login2} = request.body;
		if (DEBUG_MODE)
			console.log("Logins annul /friends/invite_cancel: ", {login1, login2});
	
		try {

			const user2 = await getUserByLogin(login2);
	
			if (!user2)
				return reply.status(400).send({error: "Login2 not found in database."});
			if (DEBUG_MODE)
				console.log("Login2 a bien ete trouve dans la base de donnees: ", {login2});

			notifyUser(login2, 'friend_invite_cancel', {
				message: `Vous avez une invite annule : ${login1}`,
				loginInviteur: `${login1}`
			});
	
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
			const user2 = await getUserByLogin(login2);
	
			if (!user2)
				return reply.status(400).send({error: "Login2 not found in database."});
			if (DEBUG_MODE)
				console.log("Login2 a bien ete trouve dans la base de donnees: ", {login2});
	
	
			notifyUser(login2, 'friend_invite_decline', {
				message: `Vous avez une invite refuse : ${login1}`,
				loginInviteur: `${login1}`
			});
	
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
			console.log("Logins accept /friends/invite_accept: ", {login1, login2});
	
		try {
			const user2 = await getUserByLogin(login2);
	
			if (!user2)
				return reply.status(400).send({error: "Login2 not found in database."});
			if (DEBUG_MODE)
				console.log("Login2 a bien ete trouve dans la base de donnees: ", {login2});
	

			notifyUser(login2, 'friend_invite_accepted', {
				message: `Vous avez une invite accepte : ${login1}`,
				loginInviteur: `${login1}`
			});
	
			reply.send({message: "Invite accepted successfully."});
		} catch (err) {
			if (DEBUG_MODE)
				console.error("Erreur d'acceptation d'invite ami.\n", err);
			reply.status(500).send({error: err.message});
		}
	});

}