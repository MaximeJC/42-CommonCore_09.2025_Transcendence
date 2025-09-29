<script setup lang="ts">
import { USER_MANAGEMENT_URL } from '@/config/config.js';
import { onMounted, onUnmounted, ref ,nextTick , watch, } from "vue"
import { setLanguage, updateText } from '../../../service/translators';
import { user } from '../../../user';
import { startMatchmaking } from "../../../../public/includes/js/app.js";

const pongServerPath = import.meta.env.VITE_PONG_SERVER_BASE_URL;
const aiServerPath = import.meta.env.VITE_AI_SERVER_BASE_URL;

const props = defineProps<{
	setLanguage: (lang: string) => void;
	act_match: Array<string>
}>();

onMounted(async () => {
	await nextTick()
	updateText()   // <-- c’est ça qu’il faut appeler au premier rendu
})


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

// GESTION DE L'EVENEMENT DE FIN DE PARTIE
async function handleGameResult(event: CustomEvent) {
	console.log("Evenement 'gameresult' capture par Vue!", event.detail);
	gameResult.value = event.detail; // Met a jour nos donnees
	showResultScreen.value = true;
	await nextTick();  
	updateText()
}

const emit = defineEmits(['match_rslt']);

const showSetting = (winner: string, loser: string) => {
		emit('match_rslt', winner, loser);
};

const handleReturnTournament = () => {
	console.log("retour au tournoi recu!");
	showSetting(gameResult.value.winner, gameResult.value.loser)
}

function handleStartGame() {
	showResultScreen.value = false;
	const gameConfig: GameConfig = {
		pseudo: props.act_match[0],
		opponentPseudo: props.act_match[1], // Laisser vide pour un match public
		avatarUrl: "",
		gameMode: "2P_LOCAL", //1V1_ONLINE, 1P_VS_AI, 2P_LOCAL, AI_VS_AI, 4P_ONLINE
		language: "fr" //en, fr, es
	};

	console.log("Configuration de jeu envoyee a app.js:", gameConfig);
	(window as any).networkConfig = {
		pongServerBaseUrl: pongServerPath,
		aiServerBaseUrl: aiServerPath
	};
	
	try {
		startMatchmaking(gameConfig);
	} catch (error) {
		console.error("Erreur lors du lancement du jeu:", error);
		// Réessayer après un délai si ça échoue
		setTimeout(() => {
			try {
				startMatchmaking(gameConfig);
			} catch (secondError) {
				console.error("Échec du second essai:", secondError);
			}
		}, 1000);
	}
}

onMounted(() => {
	console.log("LOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO")

	const babylonScript = document.createElement("script")
	babylonScript.src = "/includes/js/BabylonJS/babylon.js"
	document.body.appendChild(babylonScript)

	babylonScript.onload = () => {
		const guiScript = document.createElement("script")
		guiScript.src = "/includes/js/BabylonJS/gui/babylon.gui.min.js"
		document.body.appendChild(guiScript)
		
		guiScript.onload = () => {
			// Attendre que Babylon.js soit complètement initialisé
			setTimeout(() => {
				console.log("Babylon.js chargé, lancement du jeu...");
				window.addEventListener('babylon-returned-to-lobby', handleReturnTournament);
				window.addEventListener('gameresult', (event) => handleGameResult(event as CustomEvent));
				nextTick().then(() => {
					handleStartGame();
				});
			}, 500); // Délai de 500ms pour s'assurer que tout est prêt
		}
	}
})

onUnmounted(() => {
	// Nettoyer l'ecouteur pour eviter les fuites de memoire
	window.removeEventListener('gameresult', (event) => handleGameResult(event as CustomEvent));
});

//watch(() => props.act_match[1], (newVal) => {
//	 if (newVal){
//		nextTick().then(() => {
//			handleStartGame();
//		});
//	 }
//}, { immediate: true });

</script>

<template>
	<div v-show="!showResultScreen" class="tournament-home_disconnect">		
		<div id="lobby"></div>
		<canvas id="renderCanvas"></canvas>
	</div>
	
	<div ref="rootElement" title="result frame" class="tournament-result-container" v-if="showResultScreen">
		<label class="tournament-h2" data-i18n="victory.text"></label>
		<div class="tournament-winner">{{ gameResult.winner }}</div>
		<button @click="handleReturnTournament" tittle="return-button" class="tournament-return-button">
				<div data-i18n="home_player_button.return"></div>
		</button>
	</div>
</template>

<style scoped>

.tournament-result-container{
		display: grid;
		grid-template-rows: 0.5fr 0.5fr 0.5fr;
		grid-template-columns: 1fr;
		width: 30rem;
		align-content: flex-start;
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


.tournament-h2{
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

.tournament-winner{
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

.tournament-grid-row{
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

.tournament-grid-header{
		display: grid;
		padding: 3px;
		border-bottom: 1px solid #ddd;
		grid-template-columns: repeat(5, 1fr);
		justify-items: start;
		align-items: center;
	}

.tournament-grid-header > div{
		color: white;
		font-size: 1rem;
		text-shadow:
		0 0 10px #18c3cf,
		0 0 20px #18c3cf,
		0 0 40px #18c3cf;
	}

	.tournament-sub1{
		text-align: start;
		margin-right: 2rem;
	}
	.tournament-sub2{
		text-align: end;

	}
	.tournament-stat1{
		text-align: center;
		font-size: 1.5rem;

	}

	.tournament-stat2{
		text-align: end;
		font-size: 1.5rem;
		margin-right: 1rem;
	}

.tournament-home_disconnect {
	width: 100vw;
	height: 100vh;
	display: flex;
	justify-content: flex-start;
	align-items: flex-start;
	margin: 0;
	padding: 0;
	position: fixed;
	top: 0;
	left: 0;
}

#renderCanvas {
	width: 100vw;
	height: 100vh;
	z-index: -1;
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


.tournament-return-button{
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

	.tournament-return-button:hover{
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
