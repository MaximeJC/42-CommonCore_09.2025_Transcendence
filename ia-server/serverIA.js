/* 
 * ****************************************** README ******************************************
 *
 *									 IA SERVEUR - VERSION 2
 * 
 * Cette IA est sur un serveur, a executer avec la commande:	node serverIA.js
 * 
 * Son fonctionnement:
 * - Recoit l'etat complet du jeu, y compris sa propre identite et celle des autres.
 * - Analyse le contexte (1v1, 2v2, cote gauche/droit) pour decider de sa strategie.
 * - Predit la trajectoire de la balle.
 * - Se replace defensivement quand la balle est loin.
 * 
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
 * 
 * *********************************************************************************************    
*/

const DEBUG_MODE = true

const RED='\x1b[0;31m'
const GREEN='\x1b[0;32m'
const YELLOW='\x1b[1;33m'
const BLUE='\x1b[0;34m'
const RESET = "\x1b[0m";

const fastify = require('fastify')({ logger: false });
fastify.register(require('@fastify/cors'), { origin: true });

// ==========================================================
//  STRUCTURE DE DONNEES DE L'IA
// ==========================================================
let gameState = {};
let ballHistory = [];
const AI_DIFFICULTY = 0.1; // 10% de chance d'hesiter (0.0 = parfait, 1.0 = ne bouge jamais)
// ==========================================================

fastify.post('/update', (request, reply) => {
	gameState = request.body;
	if (gameState.ball) {
		// On cree une copie de l'objet balle et on y ajoute le temps
		const ballDataWithTime = {
			x: gameState.ball.x,
			y: gameState.ball.y,
			speedX: gameState.ball.speedX,
			speedY: gameState.ball.speedY,
			time: Date.now()
		};
		ballHistory.push(ballDataWithTime);
		
		if (ballHistory.length > 2)
			ballHistory.shift();
	}
	if (DEBUG_MODE)
		console.log(`${GREEN}[INFO] Nouvel etat du jeu recu.`);
	reply.send({ status: 'ok' });
});

fastify.get('/action', (request, reply) => {
	const action = decideIAAction(gameState);
	if (DEBUG_MODE)
		console.log(`${RED}[INFO] Decision de l'IA : ${JSON.stringify(action)}`)
	reply.send({ action });
});


// ==========================================================
//  CERVEAU DE L'IA
// ==========================================================

function decideIAAction(state) {
	if (!state.ball || !state.paddles || !state.paddles.me) return "NONE";

	// Determiner qui je suis et si la balle vient vers moi
	const myPaddle = state.paddles.me;
	
	let mySide;
	if (myPaddle.name.includes('left')) {
		mySide = 'left';
	} else {
		mySide = 'right';
	}
	
	let isBallComingTowardsMe;
	if (mySide === 'left' && state.ball.speedX < 0) {
		isBallComingTowardsMe = true;
	} else if (mySide === 'right' && state.ball.speedX > 0) {
		isBallComingTowardsMe = true;
	} else {
		isBallComingTowardsMe = false;
	}

	if (isBallComingTowardsMe) {
		if (DEBUG_MODE)
			console.log(`${BLUE}Balle en approche pour ${myPaddle.name}. Calcul d'interception...${RESET}`);
		return getInterceptMove(state);
	} else {
		if (DEBUG_MODE)
			console.log(`${BLUE}Balle s'eloigne de ${myPaddle.name}. Replacement...${RESET}`);
		return getRepositioningMove(state);
	}
}

function getRepositioningMove(state) {
	const myPaddle = state.paddles.me;
	
	let isTwoPlayerGame;
	if (state.paddles.all.length <= 2) {
		isTwoPlayerGame = true;
	} else {
		isTwoPlayerGame = false;
	}
	
	let targetY;
	if (isTwoPlayerGame) {
		targetY = 100; // En 1v1, retourner au centre (Y=100)
	} else {
		if (myPaddle.name.includes('top')) {
			targetY = 50; // En 2v2, retourner au centre de la zone haute
		} else {
			targetY = 150; // En 2v2, retourner au centre de la zone basse
		}
	}

	const differenceY = targetY - myPaddle.y;
	if (differenceY > 10)
		return "DOWN";
	if (differenceY < -10)
		return "UP";
	return "NONE";
}

function getInterceptMove(state) {
	const predictedLandingY = predictBallLandingY(state);
	const myPaddleY = state.paddles.me.y;
	const differenceY = predictedLandingY - myPaddleY;
	const deadZone = 10;

	if (Math.random() < AI_DIFFICULTY) {
		if (DEBUG_MODE)
			console.log(`${YELLOW}L'IA hesite...${RESET}`);
		return "NONE";
	}

	if (differenceY > deadZone)
		return "DOWN";
	if (differenceY < -deadZone)
		return "UP";
	return "NONE";
}

function predictBallLandingY(state) {
	if (ballHistory.length < 2)
		return state.ball.y;

	const lastPos = ballHistory[1];
	const prevPos = ballHistory[0];
	const deltaTime = (lastPos.time - prevPos.time) / 1000.0;
	if (deltaTime === 0)
		return lastPos.y;

	const speedX = (lastPos.x - prevPos.x) / deltaTime;
	const speedY = (lastPos.y - prevPos.y) / deltaTime;
	
	let mySide;
	if (state.paddles.me.name.includes('left')) {
		mySide = 'left';
	} else {
		mySide = 'right';
	}
	
	let targetX;
	if (mySide === 'left') {
		targetX = 0;
	} else {
		targetX = 200;
	}
	
	let ballGoingWrongWay;
	if (mySide === 'left' && speedX >= 0) {
		ballGoingWrongWay = true;
	} else if (mySide === 'right' && speedX <= 0) {
		ballGoingWrongWay = true;
	} else {
		ballGoingWrongWay = false;
	}
	if (ballGoingWrongWay) {
		return state.ball.y;
	}

	const timeToReach = (targetX - lastPos.x) / speedX;
	let predictedY = lastPos.y + (speedY * timeToReach);

	while (predictedY < 0 || predictedY > 200) {
		if (predictedY < 0) predictedY = -predictedY;
		if (predictedY > 200) predictedY = 400 - predictedY;
	}
	
	if (DEBUG_MODE)
		console.log(`${YELLOW}Prediction pour ${state.paddles.me.name}: la balle atterrira a y=${predictedY.toFixed(2)}${RESET}`);
	return predictedY;
}

const start = async () => {
	try {
		await fastify.listen({ port: 3001, host: '0.0.0.0' });
	if (DEBUG_MODE)
		console.log(`${YELLOW}Serveur IA démarré sur http://localhost:3001`);
	} catch (err) {
		console.error(err);
		process.exit(1);
  }
};

start();
