<script setup lang="ts">
	import { onMounted, onUnmounted, ref } from "vue"
	import * as BABYLON from "babylonjs"
	import * as GUI from "@babylonjs/gui"
	//import "@babylonjs/loaders/glTF"

	onMounted(() => {
		// Charger Babylon et app.js depuis public
		const babylonScript = document.createElement("script")
		babylonScript.src = "/includes/js/BabylonJS/babylon.js"
		document.body.appendChild(babylonScript)

		babylonScript.onload = () => {
			const guiScript = document.createElement("script")
			guiScript.src = "/includes/js/BabylonJS/gui/babylon.gui.min.js"
			document.body.appendChild(guiScript)

			guiScript.onload = () => {
			const appScript = document.createElement("script")
			appScript.type = "module"
			appScript.src = "/includes/js/app.js"
			document.body.appendChild(appScript)
			}
		}
	})

</script>

<template>
<div class="game-wrapper">
    <!-- lobby -->
    <div id="lobby">
      <h1>🔥 Hell's Gate Pong 🔥</h1>
      <div class="form-group">
        <label for="pseudo-input">Choose your Pseudo:</label>
        <input type="text" id="pseudo-input" maxlength="15" placeholder="Your Name" />
      </div>
      <div class="form-group">
        <label for="opponent-pseudo-input">Opponent's Pseudo (Optional):</label>
        <input type="text" id="opponent-pseudo-input" maxlength="15" placeholder="Leave empty for public match" />
      </div>
      <div class="form-group">
        <label for="avatar-input">Avatar URL (Optional):</label>
        <input type="text" value="includes/img/avatar1.jpg" id="avatar-input" maxlength="1024" placeholder="Url avatar" />
      </div>
      <div class="form-group">
        <label for="gamemode-select">Choose Game Mode:</label>
        <select id="gamemode-select">
          <option value="1V1_ONLINE" selected>1 vs 1 Online</option>
          <option value="1P_VS_AI">1 Player vs AI</option>
          <option value="2P_LOCAL">2 Players (Local)</option>
          <option value="AI_VS_AI">AI vs AI (Spectator)</option>
          <option value="4P_ONLINE">4 Players Online</option>
        </select>
      </div>
      <div class="form-group">
        <label for="language-select">Language:</label>
        <select id="language-select">
          <option value="en" selected>English</option>
          <option value="fr">Français</option>
          <option value="es">Español</option>
        </select>
      </div>
      <button id="start-game-button">START</button>
    </div>

    <!-- canvas Babylon -->
    <canvas id="renderCanvas"></canvas>
  </div>
</template>

<style scoped>
html, body, .game-wrapper {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  background: black;
  align-content: center;
  justify-content: center;
}

#renderCanvas {
  width: 100vw;
  height: 100vh;
  display: none; /* masqué au début */
}
</style>