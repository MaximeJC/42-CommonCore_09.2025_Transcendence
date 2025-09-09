const RED='\x1b[0;31m'
const GREEN='\x1b[0;32m'
const YELLOW='\x1b[1;33m'
const BLUE='\x1b[0;34m'
const RESET = "\x1b[0m";

// framework fastify et desactiver les logs
const fastify = require('fastify')({ logger: false });
// plugin Cross-Origin Resource Sharing: permet a n'importe quel site d'appeler l'API
fastify.register(require('@fastify/cors'), { origin: true });

// variable globale (let) gameState qui stocke l'etat actuel du jeu
let gameState = {
	ball:     { x: 0, y: 0, speedX: 0, speedY: 0 },	// position et vitesse de la balle
	paddles:  { left: 0, right: 0 }				          // position des raquettes
};

// le serveur recoit l'etat du jeu:
fastify.post('/update', (request, reply) => { // definit une route POST a l'url /update: le jeu renverra l'etat actuel du jeu a cet url
	gameState = request.body;                   // recupere les donnees contenues dans gameState, en JSON
	console.log(`${GREEN}[INFO] Etat du jeu mis à jour : ${JSON.stringify(gameState)}`);
	reply.send({ status: 'ok' });               // renvoie reponse JSON au jeu pour confirmer la maj de l'etat
});

// le serveur renvoie l'action de l'IA
fastify.get('/action', (request, reply) => { // definit une route GET a l'url /action
	const action = decideIAAction(gameState);
	console.log(`${RED}[INFO] Decision d\'action de l\'IA : ${JSON.stringify(action)}`)
	reply.send({ action }); // renvoie l'action au jeu
});

/* 
*        0       +100        +200
*     0 +-------------------------> abscisses x
*       |
*       |
*       |	|				o			 |
*  +100 |
*       |
*       |
*       |
*  +200 | ordonnees: y (en informatique graphique, y augmente vers le bas)
*       V
*     
*/

let nbErrors = 0;
let nbTests = 0;

// decision de l'IA suit la balle en Y
function decideIAAction(state) {
	const paddleRight = state.paddles.right; // position Y de la raquette droite (= celle de l'IA)
	const ballY = state.ball.y; // position de la balle en Y

	nbTests++;
	console.log(`${YELLOW}${nbTests}eme test:${RESET}`);

	// --- CORRECTION : La variable doit etre declaree avec 'let' ---
	let errorRate = 0.1; // 10% d'erreur de base
	if (((ballY - paddleRight) >= 100) || (ballY - paddleRight) <= -100) // balle loin (verifier ordre de grandeur, ici 100 pixels)
		errorRate = 0.2; // 20% d'erreur si la balle est loin

	if (ballY < paddleRight) {
		if (Math.random() < errorRate) {
			nbErrors++;
			if (((ballY - paddleRight) <= 10) && (ballY - paddleRight) >= -10) { // balle proche (verifier ordre de grandeur, ici 10 pixels)
				console.log(`${BLUE}L'IA ne bouge pas | % erreurs = ${nbErrors/nbTests}${RESET}`);
				return "NONE"; // si balle proche, erreur naturelle = se figer
			}
			console.log(`${BLUE}L'IA se trompe et descend au lieu de monter | % erreurs = ${nbErrors/nbTests}${RESET}`);
			return "DOWN";
		}
		return "UP";
	}

	if (ballY > paddleRight) {
		if (Math.random() < errorRate) {
			nbErrors++;
			if (((ballY - paddleRight) <= 10) && (ballY - paddleRight) >= -10) { // balle proche (verifier ordre de grandeur, ici 10 pixels)
				console.log(`${BLUE}L'IA ne bouge pas | % erreurs = ${nbErrors/nbTests}${RESET}`);
				return "NONE"; // si balle proche, erreur naturelle = se figer
			}
			console.log(`${BLUE}L'IA se trompe et monte au lieu de descendre | % erreurs = ${nbErrors/nbTests}${RESET}`);
			return "UP";
		}
		return "DOWN";
	}

	return "NONE";
}

// fonction de demarrage du serveur
const start = async () => {
	try{
		// --- CORRECTION : Le port doit etre different du serveur de jeu principal ---
		await fastify.listen({ port: 3001, host: '0.0.0.0' }); // demarre le serveur sur le port 3001
		console.log(`${YELLOW}Serveur IA démarré sur http://localhost:3001`); // affiche message de confirmation quand serveur pret
	} catch (err) {
		// fastify.log.error(err) ne fonctionne pas car le logger est desactive. On utilise console.error.
		console.error(err);
		process.exit(1);
	}
};

start(); // appel de la fonction de demarrage