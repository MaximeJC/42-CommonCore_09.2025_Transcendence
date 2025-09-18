<script setup lang="ts">
	import { onMounted, ref ,nextTick , watch, } from "vue"
	import * as BABYLON from "babylonjs"
	import * as GUI from "@babylonjs/gui"
	import { user } from '../../user';
	import tournament from "./tournament_page.vue";
	// Importe la fonction de demarrage depuis le module app.js.
	import { startMatchmaking } from "../../../public/includes/js/app.js";

	const emit = defineEmits(['gameisfinish']);

	const props = defineProps<{
		setLanguage: (lang: string) => void;
		activePlay: string;
	}>();
	
	const { currentUser } = user();


//// TODO : envoyer les vrai donnees
//	// definit la config du jeu ici, dans des variables.
	interface GameConfig {
		pseudo: string;
		opponentPseudo: string; // Laisser vide pour un match public
		avatarUrl: string; // Laisser vide pour avatar defaut
		gameMode: string; //1V1_ONLINE, 1P_VS_AI, 2P_LOCAL, AI_VS_AI, 4P_ONLINE
		language: string; //en, fr, es
	};

	function handleStartGame() {
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
	})

	watch(() => props.activePlay, (newVal) => {
		if (newVal === "1P_VS_AI" || newVal === "2P_LOCAL" ){
			nextTick().then(() => {
				handleStartGame();
			});
		}
	})
</script>

<template>
	<div v-show="props.activePlay != 'tournament'" class="home_disconnect">
		<div id="lobby"></div>

		<canvas id="renderCanvas"></canvas>
	</div>
	<div v-show="props.activePlay === 'tournament'">
		<tournament :setLanguage="props.setLanguage"></tournament>
	</div>
</template>

<style scoped>

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