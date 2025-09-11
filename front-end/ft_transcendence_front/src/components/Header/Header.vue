<script setup lang="ts">
	import { ref } from 'vue';
	import LangMenu from './LanguageMenu.vue';
	import setting from './setting_button.vue'
	const props = defineProps<{
		setLanguage: (lang: string) => void;
		isConnect: boolean;
	}>();
	const emit = defineEmits(['show-form']);

</script>

<template>
	<header class="header">
		<h1 class="logo">FT_TRANSCENDENCE</h1>
		<div class="end-button">
			<setting v-show="isConnect" :setLanguage="props.setLanguage"></setting>
			<button @click="emit('show-form')"  class="my-button" title="sign_up" >
				<div v-show="!isConnect" data-i18n="header.signUp"></div>
				<div v-show="isConnect" data-i18n="header.signOut"></div>
			</button>
			<lang-menu :setLanguage="props.setLanguage"></lang-menu>
		</div>
	</header>
</template>

<style>
	@font-face {
	font-family: "netron";
	src: url("../../fonts/netron.regular.otf") format("opentype");
	}
	@font-face {
	font-family: "neon";
	src: url("../../fonts/neon-shine.italic.otf") format("opentype");
	}

	.header{
		display: flex;
		justify-content: space-between;
		align-items:flex-start
	}

	.end-button{
		display: flex;
		justify-content: end;
		margin-top: 2rem;
		margin-right: 3rem;
		gap: 2rem;
	}

	.my-button{
		font-family: netron;
		background-color: rgba(156, 50, 133, 0.5);
		font-size: 2rem;
		color: white;
		border: 2px solid #e251ca;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #ff69b4,
		0 0 120px #dd0aba;
		box-shadow: 
		0 0 5px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba;
		padding: 1rem 2rem;
		border-radius: 20px;
		cursor: pointer;
		transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
	}

	.my-button > div {
		margin-top: 0.5rem;
	}
	.my-button:hover{
		background-color: rgba(251, 255, 34, 0.5);
		border: 2px solid #fbff22;
		box-shadow: 
		0 0 5px #fbff22,
		0 0 10px #fbff22,
		0 0 20px #fbff22,
		0 0 40px #fbff22,
		0 0 80px #fbff22;

		text-shadow: 
		0 0 10px #fbff22,
		0 0 10px #fbff22,
		0 0 20px #fbff22,
		0 0 40px #fbff22,
		0 0 80px #fbff22,
		0 0 120px #fbff22;
	}

	.logo{
		background-color: rgba(156, 50, 133, 0);
		font-family: neon;
		color: #ffbcf4;
		margin-left: 1.5rem;
		font-size: 5rem;
		margin-top: 1.4rem;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #ff69b4,
		0 0 120px #dd0aba;
		position: relative;
	}
	.logo::after {
		content: '';
		position: absolute;
		width: 40rem;
		height: 0.4rem;
		background-color: #fafc95; /* Couleur de la ligne de soulignement */
		box-shadow:
			0 0 10px #fbff22,
			0 0 10px #fbff22,
			0 0 20px #fbff22,
			0 0 40px #fbff22,
			0 0 80px #fbff22,
			0 0 120px #fbff22;
		bottom: 0;
		left: 0;
	}

	@media (max-width: 1600px) {
		.end-button{
			margin-top: 1.5rem;
			margin-right: 2rem;
			gap: 1.5rem;
		}

		.my-button{
			font-size: 1.5rem;
			padding: 1rem 2rem;
		}
		.my-button > div {
			margin-top: 0.5rem;
		}
		.logo {
			font-size: 4rem; /* Ajustez la taille de la police */
			margin-left: 1.2rem;
			margin-top: 0.8rem;

		}
		.logo::after {
			width: 32rem; /* Réduisez la longueur de la ligne */
		}
	}

	@media (max-width: 992px) {
    	.logo {
    	    font-size: 3rem;
    	    margin-left: 1rem;
			
    	}
    	.logo::after {
    	    width: 24rem; /* Réduire la longueur de la ligne */
		}
	}
	@media (max-width: 576px) {
    	.logo {
    	    font-size: 2.5rem;
    	    margin-left: 0.5rem;
    	}
    	.logo::after {
    	    width: 100%;
    	}
	}
	
</style>