<script setup lang="ts">
	import { onMounted, onUnmounted, ref ,nextTick , watch, } from "vue"
	import * as BABYLON from "babylonjs"
	import * as GUI from "@babylonjs/gui"
	import { user } from '../../user';
	// Importe la fonction de demarrage depuis le module app.js.
	import { startMatchmaking } from "../../../public/includes/js/app.js";

	const emit = defineEmits(['gameisfinish']);

	const props = defineProps<{
		setLanguage: (lang: string) => void;
		activePlay: string;
	}>();
	
	const { currentUser } = user();

	const showResultScreen = ref(false);
	const gameResult = ref({
		winner: 'lewin',
		loser: 'leperdant',
		score_left: 0,
		score_right: 0,
		duration: 0
	});


//// TODO : envoyer les vrai donnees
//	// definit la config du jeu ici, dans des variables.
	interface GameConfig {
		pseudo: string;
		opponentPseudo: string; // Laisser vide pour un match public
		avatarUrl: string; // Laisser vide pour avatar defaut
		gameMode: string; //1V1_ONLINE, 1P_VS_AI, 2P_LOCAL, AI_VS_AI, 4P_ONLINE
		language: string; //en, fr, es
	};

	// --- GESTION DE L'EVENEMENT DE FIN DE PARTIE ---
	function handleGameResult(event: CustomEvent) {
		console.log("Evenement 'gameresult' capture par Vue!", event.detail);
		gameResult.value = event.detail; // Met a jour nos donnees
		showResultScreen.value = true;
	}

	function handleStartGame() {
		showResultScreen.value = false;
		const gameConfig: GameConfig = {
			pseudo: currentUser.value?.login ?? "",
			opponentPseudo: "", // Laisser vide pour un match public
			avatarUrl: "includes/img/avatar1.jpg", // Laisser vide pour avatar defaut
			gameMode: props.activePlay, //1V1_ONLINE, 1P_VS_AI, 2P_LOCAL, AI_VS_AI, 4P_ONLINE
			language: "fr" //en, fr, es
		};

		if(props.activePlay === "2P_LOCAL")
			gameConfig.opponentPseudo = "Player2"
		console.log("Configuration de jeu envoyee a app.js:", gameConfig);
		startMatchmaking(gameConfig);
	}

	onMounted(() => {
		const babylonScript = document.createElement("script")
		babylonScript.src = "/includes/js/BabylonJS/babylon.js"
		document.body.appendChild(babylonScript)

		babylonScript.onload = () => {
			const guiScript = document.createElement("script")
			guiScript.src = "/includes/js/BabylonJS/gui/babylon.gui.min.js"
			document.body.appendChild(guiScript)
		}

		window.addEventListener('gameresult', handleGameResult as EventListener);
	})

	onUnmounted(() => {
		// Nettoyer l'ecouteur pour eviter les fuites de memoire
		window.removeEventListener('gameresult', handleGameResult as EventListener);
	});

	watch(() => props.activePlay, (newVal) => {
		if (newVal === "1P_VS_AI" || newVal === "2P_LOCAL" ){
			nextTick().then(() => {
				handleStartGame();
			});
		}
	})
</script>

<template>
	
<!-- <div class="game-wrapper"> -->
	<div class="home_disconnect">
		<!-- lobby -->
		<div id="lobby"></div>

		<canvas id="renderCanvas"></canvas>
	</div>
		<div ref="rootElement" title="result frame" class="result-container" v-if="showResultScreen">
			<div class="title-resultat" >Resultat</div>

			<div class="h2">Vainqueur:</div> 
			<div class="winner">{{ gameResult.winner }}</div>

			<div title="result-header" class="grid-header">
				<div class="sub1" data-i18n="">Score gauche</div>
				<div class="sub1" data-i18n="">Perdant</div>
				<div class="sub2" data-i18n="">Duree</div>
				<div class="sub2" data-i18n="">Score droite</div>
			</div>
			<div class="result-list-container">
				<div class="grid-row">
					<div class="stat1">{{ gameResult.score_left }}</div>
					<div class="stat1">{{ gameResult.loser }}</div>
					<div class="stat2">{{ gameResult.duration }} s</div>
					<div class="stat2">{{ gameResult.score_right }}</div>
				</div>
			</div>
	</div>
</template>

<style scoped>

.result-container{
		display: grid;
		grid-template-rows: min-content;
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

.title-resultat{
		grid-column: 1 / -1;
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
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

.h1{
		grid-column: 1 / -1;
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
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}

.h2{
		grid-column: 1 / -1;
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
		font-size: 1.5rem;
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
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
	}

.grid-row{
		display: grid;
		grid-template-columns: 0.1fr 0.6fr 0.3fr 0.3fr;
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
		grid-template-columns: 0.3fr 0.5fr 0.1fr 0.3fr;
		padding: 3px;
		border-bottom: 1px solid #ddd;
		/*justify-content: ;*/
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


</style>