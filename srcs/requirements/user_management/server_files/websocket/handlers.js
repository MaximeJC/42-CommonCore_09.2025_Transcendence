/* Evenements WebSocket: connexion, messages, deconnexion */

export const userSocketMap = new Map();

export function notifyAllsocket(eventSend, messageSend) {
	for (const [login, connection] of userSocketMap.entries()) {
		console.log(`Traitement pour l'utilisateur ${login} avec le socket ID ${connection.id}`);
		const targetSocket = userSocketMap.get(login);
		if (targetSocket && targetSocket.readyState === 1) {			
			const notification = {
				event: eventSend,
				payload: { message: messageSend }
			};
			targetSocket.send(JSON.stringify(notification));
		}		
	}
}

export async function setupWebSocketHandlers(fastify) {
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

}
