<script setup lang="ts">
	import { ref } from 'vue';
	import LangMenu from './LanguageMenu.vue';

	const props = defineProps<{
		setLanguage: (lang: string) => void;
	}>();
	const emit = defineEmits(['show-form']);

	const isSignedUp = ref(false);

	const toggleText = () => {
		isSignedUp.value = !isSignedUp.value;
	}
</script>

<template>
	<header class="header">
		<h1 class="logo">FT_TRANSCENDENCE</h1>
		<div class="end-button">
			<button @click="emit('show-form'); toggleText()"  class="my-button" title="sign_up" >
				<div v-show=" !isSignedUp" data-i18n="header.signUp"></div>
				<div v-show=" isSignedUp" data-i18n="home.connection"></div>
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
		margin-top: 25px;
		margin-right: 1%;
		gap: 15px;
	}

	.my-button{
		gap: 14px;
		font-family: netron;
		background-color: rgba(156, 50, 133, 0.5);
		font-size: 200%;
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
		padding: 10px 20px;
		border-radius: 20px;
		cursor: pointer;
		transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
	}

	.my-button > div {
		margin-top: 5px;
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
		margin-left: 2%;
		font-size: 500%;
		text-underline-offset: 15px;
		margin-top: 1px;
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
	width: 100%;
	height: 4px;
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

	.lang-icon{
		position:relative


	}
</style>