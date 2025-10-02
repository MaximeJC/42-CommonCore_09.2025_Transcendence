<script setup lang="ts">
import { USER_MANAGEMENT_URL } from '@/config/config.js';
import { onMounted, onUnmounted, ref ,nextTick , watch, } from "vue"
import { setLanguage, updateText, currentLang } from '../../service/translators';
import { user } from '../../user';
import { startMatchmaking } from "../../../public/includes/js/app.js";

// const pongServerPath = import.meta.env.VITE_PONG_SERVER_BASE_URL;
// const aiServerPath = import.meta.env.VITE_AI_SERVER_BASE_URL;

const props = defineProps<{
	setLanguage: (lang: string) => void;
	activePlay: string;
	opponentLogin?: string | null;
}>();

const emit = defineEmits<{
	(e: 'clear-opponent'): void;
}>();

onMounted(async () => {
	await nextTick()
	updateText()
})


const { currentUser } = user();
let gameConfig: GameConfig | undefined;
const showResultScreen = ref(false);
const gameResult = ref({
	winner: '',
	loser: '',
	score_left: 0,
	score_right: 0,
	duration: 0,
	gameMode: '',
	playerLeftTop: '',
	playerRightTop: '',
	game_id: ''
});

// definit la config du jeu ici, dans des variables.
interface GameConfig {
	pseudo: string;
	opponentPseudo: string; // Laisser vide pour un match public
	avatarUrl: string; // Laisser vide pour avatar defaut
	gameMode: string; //1V1_ONLINE, 1P_VS_AI, 2P_LOCAL, AI_VS_AI, 4P_ONLINE
	language: string; //en, fr, es
};

async function addGameToDataBase(newGame: any) {
	if (!newGame.winner || !newGame.loser) {
		console.error("Donnees de partie incompletes", newGame);
		return;
	}
	
	// Ne sauvegarder que les parties 1V1 en ligne (entre vrais joueurs)
	if (newGame.gameMode !== "1V1_ONLINE") {
		console.log(`Partie en mode ${newGame.gameMode} - pas de sauvegarde dans la BDD`);
		return;
	}
	
	try {
		const response = await fetch(`${USER_MANAGEMENT_URL}/games`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				login_winner: newGame.winner,
				login_loser: newGame.loser,
				score_winner: newGame.score_left > newGame.score_right? newGame.score_left : newGame.score_right,
				score_loser: newGame.score_left <= newGame.score_right? newGame.score_left : newGame.score_right,
				game_id: newGame.gameId
			})
		}
		);
		if (!response.ok)
			throw new Error(`Erreur http: ${response.status}`);
		// console.log("Partie enregistree dans la base de donnees avec succes.");
	} catch (err) {
		console.error("Erreur d'ajout de partie a la base de donnees:", err);
	}
}

// GESTION DE L'EVENEMENT DE FIN DE PARTIE
async function handleGameResult(event: CustomEvent) {
	console.log("Evenement 'gameresult' capture par Vue!", event.detail);
	gameResult.value = event.detail; // Met a jour nos donnees
	showResultScreen.value = true;
	await nextTick();  
	updateText()
	if (gameResult.value.gameMode === "1V1_ONLINE")
		addGameToDataBase(gameResult.value);
}

const handleReturnToLobby = () => {
	console.log("retour au lobby recu!");
	showResultScreen.value = false;
	gameConfig = undefined;
	emit('clear-opponent'); // Nettoie l'opponent quand on retourne au lobby
	const target = 'profil';
	window.location.hash = target.startsWith('/') ? target : '/' + target;
}

function handleStartGame() {
	showResultScreen.value = false;
	gameConfig = {
		pseudo: currentUser.value?.login ?? "",
		opponentPseudo: props.opponentLogin || "", // Laisser vide pour un match public
		avatarUrl: currentUser.value?.avatar_url ?? "",
		gameMode: props.activePlay, //1V1_ONLINE, 1P_VS_AI, 2P_LOCAL, AI_VS_AI, 4P_ONLINE
		language: currentLang //en, fr, es
	} as GameConfig;

	if (props.activePlay === "1V1_ONLINE" && props.opponentLogin) {
		gameConfig.opponentPseudo = props.opponentLogin;
	}
	console.log("Configuration de jeu envoyee a app.js:", gameConfig);
	// (window as any).networkConfig = {
	// 	pongServerBaseUrl: pongServerPath,
	// 	aiServerBaseUrl: aiServerPath
	// };
	startMatchmaking(gameConfig);
}

onMounted(() => {
	// const babylonScript = document.createElement("script")
	// babylonScript.src = "/includes/js/BabylonJS/babylon.js"
	// document.body.appendChild(babylonScript)

	// babylonScript.onload = () => {
	// 	const guiScript = document.createElement("script")
	// 	guiScript.src = "/includes/js/BabylonJS/gui/babylon.gui.min.js"
	// 	document.body.appendChild(guiScript)
	// }

	window.addEventListener('babylon-returned-to-lobby', handleReturnToLobby);
	window.addEventListener('gameresult', (event) => handleGameResult(event as CustomEvent));
})

onUnmounted(() => {
	// Nettoyer l'ecouteur pour eviter les fuites de memoire
	window.removeEventListener('babylon-returned-to-lobby', handleReturnToLobby);
	window.removeEventListener('gameresult', (event) => handleGameResult(event as CustomEvent));
});

watch(() => props.activePlay, (newVal) => {
	 if (newVal === "1P_VS_AI" || newVal === "2P_LOCAL" || newVal === "1V1_ONLINE" || newVal === "4P_ONLINE" ){
		nextTick().then(() => {
			handleStartGame();
		});
	 }
}, { immediate: true });

</script>

<template>
	<div v-show="props.activePlay != 'tournament' && !showResultScreen" class="home_disconnect">		
		<div id="lobby"></div>
		<canvas id="renderCanvas"></canvas>
	</div>
	
	<div ref="rootElement" title="result frame" class="result-container" v-if="showResultScreen">
		<label class="h2" data-i18n="victory.text"></label>
		<div class="winner">{{ gameResult.winner }}</div>
		<button @click="handleReturnToLobby" tittle="return-button" class="return-button">
				<div data-i18n="home_player_button.return"></div>
		</button>
	</div>
</template>

<style scoped>

.result-container{
		display: grid;
		grid-template-rows: 0.5fr 0.5fr 0.5fr;
		grid-template-columns: 1fr;
		width: max-content;
		height: 15rem;
		background-color: rgba(156, 50, 133, 0.5);
		border: 2px solid #e251ca;
		box-shadow:
		0 0 5px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba;
		padding: 2rem 2rem;
		border-radius: 20px;
	}


.h2{
		text-align: center;
		font-family: netron;
		font-weight: bold;
		color: white;
		text-shadow:
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #ff69b4,
		0 0 120px #dd0aba;
		font-size:3rem;
		margin-bottom: 0.5rem;
	}

.winner{
		grid-column: 1 / -1;
		text-align: center;
		font-family: netron;
		font-weight: bold;
		color: white;
		text-shadow:
		0 0 10px #27cf18,
		0 0 20px #27cf18,
		0 0 40px #27cf18;
		font-size: 3.5rem;
		margin-bottom: 0.5rem;
	
	}

.grid-row{
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		align-items: center;
		justify-items: center;
		padding: 3px;
		border-bottom: 1px solid #ddd;
		color: white;
		font-size: 1.5rem;
		text-shadow:
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #ff69b4,
		0 0 120px #dd0aba;
		border-bottom: 1px solid #ddd;
		/*justify-content: ;*/
	}

.grid-header{
		display: grid;
		padding: 3px;
		border-bottom: 1px solid #ddd;
		grid-template-columns: repeat(5, 1fr);
		justify-items: start;
		align-items: center;
	}

.grid-header > div{
		color: white;
		font-size: 1rem;
		text-shadow:
		0 0 10px #18c3cf,
		0 0 20px #18c3cf,
		0 0 40px #18c3cf;
	}

	.sub1{
		text-align: start;
		margin-right: 2rem;
	}
	.sub2{
		text-align: end;

	}
	.stat1{
		text-align: center;
		font-size: 1.5rem;

	}

	.stat2{
		text-align: end;
		font-size: 1.5rem;
		margin-right: 1rem;
	}

.home_disconnect {
	width: 100vw;
	height: 100vh;
	display: flex;
	justify-content: flex-start;
	align-items: flex-start;
	margin: 0;
	padding: 0;
	position: fixed;
	top: 50%;
	left: 50%;
}

#renderCanvas {
	width: 100vw;
	height: 100vh;
	z-index: 9999;
	display: none;
	margin: 0;
	padding: 0;
	position: absolute;
	top: 0;
	left: 0;
}

#lobby {
	color: white;
	z-index: 1;
	position: relative;
}


.return-button{
		width: fit-content;
		height: auto;
		justify-self: center;
		align-self: center;
		font-family: netron;
		background-color: rgba(156, 50, 133, 0.5);
		font-size: 1rem;
		color: white;
		border: 2px solid #e251ca;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 30px #dd0aba;
	
		box-shadow: 
		0 0 5px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba;
		padding: 1rem 1rem;
		border-radius: 20px;
		cursor: pointer;
		transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
	}

	.return-button:hover{
		background-color: rgba(251, 255, 34, 0.5);
		border: 2px solid #fbff22;
		box-shadow:
		0 0 5px #fbff22,
		0 0 10px #fbff22,
		0 0 20px #fbff22;

		text-shadow: 
		0 0 10px #fbff22,
		0 0 10px #fbff22,
		0 0 20px #fbff22;
	}

</style>
