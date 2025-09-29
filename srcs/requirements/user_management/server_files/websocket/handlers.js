export const userSocketMap = new Map();

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

export function notifyUser(targetUserId, event, payload) {
	const targetSocket = userSocketMap.get(targetUserId);

	if (targetSocket && targetSocket.readyState === 1) { 
		console.log(`Utilisateur ${targetUserId} trouvé, envoi de la notification.`);
		
		const notification = {
			event: event,
			payload: payload
		};
		
		targetSocket.send(JSON.stringify(notification));

	} else {
		console.log(`L'utilisateur ${targetUserId} n'est pas connecte via WebSocket ou sa connexion est inactive.`);
	}
}

export function initializeWebSocket(fastify, dependencies) {
	const { db } = dependencies;

	fastify.get('/ws', { websocket: true }, (connection, req) => {
		console.log("--- Handler WebSocket demarre pour une nouvelle connexion. ---");
		try {
			let currentUserId = null;

			console.log(`Client connecte avec succes ! Attachement des listeners...`);

			connection.on('message', (message) => {
				try {
					const data = JSON.parse(message.toString());

					if (data.event === 'register' && data.payload) {
						currentUserId = data.payload;
						try {
							db.run(
								`UPDATE users SET connected = ? WHERE id = ?`,
								[1, currentUserId],
								(err) => {
									if (err)
										console.log("Erreur de mise a jour de connexion du joueur:", err);
								}
							);
							notifyAllsocket('friend_update', `Ami connecte`);

						} catch (err) {
							console.log("WebSocket connecte error:", err);
						}
						console.log(`WebSocket enregistre pour l'utilisateur ${currentUserId}`);
						userSocketMap.set(currentUserId, connection);
					}

				} catch (error) {
					console.error('Erreur de message WebSocket:', error);
				}
			});

			connection.on('close', () => {
				console.log(`WebSocket deconnecte (evenement 'close' reçu).`);
				if (currentUserId) {
					db.serialize(() => { 
						try {
							db.run(
								`UPDATE users SET connected = ? WHERE id = ?`,
								[0, currentUserId],
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
					userSocketMap.delete(currentUserId);
					console.log(`Entree pour ${currentUserId} supprimee.`);
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