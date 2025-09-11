/* 
 * ****************************************** READ ME ******************************************
 *
 * Cette IA est sur un serveur, a executer avec la commande:    node serverIA.js
 * 
 * Son fonctionnement a ete mis a jour :
 * - Le serveur de jeu envoie des informations en continu.
 * - L'IA possede une "vision" limitee : elle ne prend une "photographie" de la balle
 *   (position et vitesse) qu'une seule fois par seconde.
 * - Entre deux "visions", l'IA continue de prendre des decisions a chaque instant,
 *   mais en se basant sur cette photographie qui vieillit.
 * - Si la balle se dirige vers elle (selon la derniere vision), elle predit sa
 *   trajectoire et tente de l'intercepter.
 * - Sinon, elle retourne a sa position de depart.
 * 
 *                                      	/!\ 
 *                         		Le serveur de jeu peut maintenant
 *                             		envoyer des mises a jour
 *                                aussi vite qu'il le souhaite.
 *                             	L'IA gere le temps elle-meme.
 *                                      	/!\
 *
 * LE SYSTeME DE COORDONNEES EST CELUI DU JEU
 *      -38       0         +38
 *     + +-------------------------> abscisses z (nomme 'x' en interne)
 *     |
 * +38 |       (HAUT, Y positif)
 *     |
 *   0 |       (CENTRE)
 *     |
 * -38 |       (BAS, Y negatif)
 *     |
 *     V ordonnees: y
 * 
 * *********************************************************************************************    
*/

const DEBUG_MODE = true

const RED = '\x1b[0;31m'
const GREEN = '\x1b[0;32m'
const YELLOW = '\x1b[1;33m'
const BLUE = '\x1b[0;34m'
const RESET = "\x1b[0m";

const fastify = require('fastify')({
	logger: false
});
fastify.register(require('@fastify/cors'), {
	origin: true
});

// gameState contient la position des raquettes mise a jour en temps reel
let gameState = {};

// ballVision contient la derniere "photographie" que l'IA a prise de la balle.
let ballVision = null;

const aiPaddlesMemory = {}; // Memorise la position de depart de chaque IA
const DEAD_ZONE = 3.0; // Marge d'erreur pour eviter les tremblements
const VISION_INTERVAL_MS = 1000; // L'IA ne "voit" la balle que toutes les 1000ms.

// le serveur recoit l'etat du jeu:
fastify.post('/update', (request, reply) => {
	const now = Date.now();
	const newState = request.body;

	// On met toujours a jour l'etat global pour connaitre la position des raquettes.
	gameState = newState;

	// On ne met a jour notre "vision" de la balle que si 1 seconde s'est ecoulee.
	if (ballVision === null || (now - ballVision.timestamp) >= VISION_INTERVAL_MS) {
		if (DEBUG_MODE) {
			console.log(`${YELLOW}===== NOUVELLE VISION DE LA BALLE ACQUISE =====${RESET}`);
		}
		ballVision = {
			x: newState.ball.x,
			y: newState.ball.y,
			speedX: newState.ball.speedX,
			speedY: newState.ball.speedY,
			timestamp: now // On memorise quand on a vu la balle.
		};
	}

	if (DEBUG_MODE)
		console.log(`${GREEN}[INFO] Etat du jeu mis a jour.`);

	reply.send({
		status: 'ok'
	});
});

// le serveur renvoie l'action de l'IA
fastify.get('/action', (request, reply) => { // definit une route GET a l'url /action
	const action = decideIAAction(gameState, ballVision);
	if (DEBUG_MODE)
		console.log(`${RED}[INFO] Decision d\'action de l\'IA : ${JSON.stringify(action)}`)
	reply.send({
		action
	}); // renvoie l'action au jeu
});

//region---------------------------------cerveau de l'IA---------------------------------


function getHomePosition(state, paddle) {
	const isTwoPlayerGame = (state.paddles.all.length <= 2);
	if (isTwoPlayerGame) {
		return 0; // Centre du terrain Y=0
	} else {
		const wallLimit = state.gameBoundaries.wallTop;
		if (paddle.name.includes('top')) {
			return wallLimit / 2;
		} else {
			return -wallLimit / 2;
		}
	}
}

function decideIAAction(currentState, lastVision) {
	// L'IA ne peut rien decider si elle n'a jamais vu la balle ou ne se connait pas.
	if (!lastVision || !currentState.paddles || !currentState.paddles.me || !currentState.gameBoundaries) {
		return "NONE";
	}

	const myPaddle = currentState.paddles.me;

	// Memoriser la position "home" de la raquette si ce n'est pas fait.
	if (!aiPaddlesMemory[myPaddle.name]) {
		const homeY = getHomePosition(currentState, myPaddle);
		aiPaddlesMemory[myPaddle.name] = {
			homeY: homeY
		};
	}
	const homeY = aiPaddlesMemory[myPaddle.name].homeY;

	// Determiner son cote du terrain.
	let mySide;
	if (myPaddle.name.includes('left')) {
		mySide = 'left';
	} else {
		mySide = 'right';
	}

	// Determiner la direction de la balle en se basant sur la DERNIERE VISION FIABLE.
	let isBallComingTowardsMe;
	if (mySide === 'left' && lastVision.speedX < 0) {
		isBallComingTowardsMe = true;
	} else if (mySide === 'right' && lastVision.speedX > 0) {
		isBallComingTowardsMe = true;
	} else {
		isBallComingTowardsMe = false;
	}

	// Choisir une cible (targetY)
	let targetY;
	if (isBallComingTowardsMe) {
		if (DEBUG_MODE) console.log(`${BLUE}Mode: INTERCEPTION (base sur une vision vieille de ${((Date.now() - lastVision.timestamp)/1000).toFixed(1)}s)`);

		const predictedY = predictBallLandingY(currentState, lastVision);
		if (predictedY !== null) {
			targetY = predictedY;
		} else {
			// Si la prediction echoue, on se replace par securite.
			targetY = homeY;
		}
	} else {
		// Si la balle s'eloigne, la cible est la position de depart.
		if (DEBUG_MODE) console.log(`${BLUE}Mode: REPLACEMENT`);
		targetY = homeY;
	}

	// Decider du mouvement a effectuer pour atteindre la cible.
	return getMoveDecision(myPaddle.y, targetY);
}

function getMoveDecision(currentY, targetY) {
	// Calculer quel serait le mouvement correct.
	let Move;
	const differenceY = targetY - currentY;
	if (Math.abs(differenceY) <= DEAD_ZONE) {
		Move = "NONE"; // Ne pas bouger si on est assez proche.
	} else if (differenceY > 0) {
		Move = "UP"; // Y positif = HAUT
	} else {
		Move = "DOWN";
	}

	// Si aucune erreur n'est survenue, on retourne le mouvement.
	return Move;
}

function predictBallLandingY(state, vision) {
	// On extrait les objets dont on a besoin depuis l'etat du jeu
	const {
		paddles,
		gameBoundaries
	} = state;

	// Si la balle n'a pas de vitesse horizontale dans notre "vision",
	// elle ne se deplace ni vers la gauche ni vers la droite.
	// Il est donc impossible de calculer quand elle atteindra une raquette. On abandonne la prediction.
	if (vision.speedX === 0) {
		return null;
	}

	// Determiner de quel cote du terrain se trouve l'IA.
	let mySide;
	if (paddles.me.name.includes('left')) {
		mySide = 'left';
	} else {
		mySide = 'right';
	}

	// Definir la "ligne d'arrivee" horizontale (targetX) pour notre calcul.
	// C'est la coordonnee 'x' (qui correspond a 'z' dans le jeu) ou se trouve la raquette de l'IA.
	let targetX;
	if (mySide === 'left') {
		targetX = gameBoundaries.paddleHomeLeft; // ex: -38
	} else {
		targetX = gameBoundaries.paddleHomeRight; // ex: 38
	}

	// Calculer le temps necessaire pour que la balle atteigne cette ligne d'arrivee.
	// C'est la physique de base : temps = distance / vitesse.
	// La distance est la difference entre la ligne d'arrivee et la position horizontale de la balle.
	const timeToReach = (targetX - vision.x) / vision.speedX;

	// Si le temps est negatif, cela signifie que la balle s'eloigne deja de nous
	// ou est deja derriere nous. La prediction n'est donc pas pertinente.
	if (timeToReach < 0) {
		return null;
	}

	// Calculer la position verticale brute (sans les murs).
	// On utilise la meme formule : position finale = position initiale + (vitesse * temps).
	let predictedY = vision.y + (vision.speedY * timeToReach);

	// Simuler les rebonds sur les murs HAUT et BAS.
	// On boucle tant que la position predite est en dehors des limites du terrain.
	while (predictedY < gameBoundaries.wallBottom || predictedY > gameBoundaries.wallTop) {

		// Si la balle depasse le mur du BAS (Y negatif)
		if (predictedY < gameBoundaries.wallBottom) {
			// On calcule de combien la balle a depasse le mur.
			const overflow = gameBoundaries.wallBottom - predictedY;
			// On simule un rebond parfait en reportant ce depassement dans la direction opposee.
			predictedY = gameBoundaries.wallBottom + overflow;
		}

		// Si la balle depasse le mur du HAUT (Y positif)
		if (predictedY > gameBoundaries.wallTop) {
			// On calcule de combien la balle a depasse le mur.
			const overflow = predictedY - gameBoundaries.wallTop;
			// On simule un rebond parfait en reportant ce depassement dans la direction opposee.
			predictedY = gameBoundaries.wallTop - overflow;
		}
	}

	// Afficher le resultat de la prediction en mode debug.
	if (DEBUG_MODE) {
		console.log(`${YELLOW}Prediction: la balle atterrira a y=${predictedY.toFixed(2)}`);
	}

	// On retourne la position Y finale apres avoir simule tous les rebonds.
	return predictedY;
}

//endregion-----------------------------fin-cerveau de l'IA------------------------------

// fonction de demarrage du serveur
const start = async () => {
	try {
		// Le port 3001 est utilise car 3000 est pris pour le serveur du jeu.
		await fastify.listen({
			port: 3001,
			host: '0.0.0.0'
		});
		if (DEBUG_MODE)
			console.log(`${YELLOW}Serveur IA demarre sur http://localhost:3001`);
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
};

start();