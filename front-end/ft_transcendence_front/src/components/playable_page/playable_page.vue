<script setup lang="ts">
	import { onMounted, ref } from "vue"
	import * as BABYLON from "babylonjs"
	import * as GUI from "@babylonjs/gui"

	// Importe la fonction de demarrage depuis le module app.js.
	import { startMatchmaking } from "../../../public/includes/js/app.js";
	
// TODO : envoyer les vrai donnees
	// definit la config du jeu ici, dans des variables.
	const gameConfig = {
		pseudo: "kalicem",
		opponentPseudo: "", // Laisser vide pour un match public
		avatarUrl: "includes/img/avatar1.jpg", // Laisser vide pour avatar defaut
		gameMode: "1P_VS_AI", //1V1_ONLINE, 1P_VS_AI, 2P_LOCAL, AI_VS_AI, 4P_ONLINE
		language: "fr" //en, fr, es
	};

	function handleStartGame() {
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
</script>

<template>
	
<!-- <div class="game-wrapper"> -->
	<div class="home_disconnect">
		<!-- lobby -->
		<div id="lobby">
			<button class="connexion-button" @click="handleStartGame">Commencer</button>
		</div>

		<canvas id="renderCanvas"></canvas>
	</div>
</template>

<style scoped>

.home_disconnect {
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
}

#renderCanvas {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: -1; 
	display: none; 
}

#lobby {
	color: white;
	z-index: 1;
}

html, body {
	margin: 0;
	padding: 0;
	overflow: hidden;
}
</style>