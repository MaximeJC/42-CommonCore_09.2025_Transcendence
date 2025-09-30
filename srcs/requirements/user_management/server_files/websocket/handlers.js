import fastify from 'fastify';
export const userSocketMap = new Map();
import fs from 'fs';

let app;

export function notifyAllsocket(eventSend, messageSend) {
	const notification = JSON.stringify({
		event: eventSend,
		payload: {
			message: messageSend
		}
	});

	// On parcourt toutes les connexions actives et on envoie la notification
	for (const connection of userSocketMap.values()) {
		if (connection && connection.readyState === 1) {
			connection.send(notification);
		}
	}
}

export function notifyUser(targetUserLogin, event, payload) {
	const targetSocket = userSocketMap.get(targetUserLogin);

	if (targetSocket && targetSocket.readyState === 1) { 
		console.log(`Utilisateur ${targetUserLogin} trouvé, envoi de la notification.`);
		
		const notification = {
			event: event,
			payload: payload
		};
		
		targetSocket.send(JSON.stringify(notification));

	} else {
		console.log(`L'utilisateur ${targetUserLogin} n'est pas connecte via WebSocket ou sa connexion est inactive.`);
	}
}

if (process.env.NODE_ENV === 'production' && !process.env.CADDY_PROXY) {
	console.log("Demarrage en mode PRODUCTION (HTTPS/WSS)");
	app = fastify({
	  logger: true,
	  https: {
		key: fs.readFileSync('/app/certs/hgp_https.key'),
		cert: fs.readFileSync('/app/certs/hgp_https.crt')
	  }
	});
} else {
	if (process.env.CADDY_PROXY) {
		console.log("Demarrage en mode PRODUCTION avec Caddy Proxy (HTTP/WS)");
	} else {
		console.log("Demarrage en mode DEVELOPPEMENT (HTTP/WS)");
	}
	app = fastify({
	  logger: true
	});
}

export function initializeWebSocket(fastify, dependencies) {
	const { db } = dependencies;

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
					db.serialize(() => { 
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
}