<script setup lang="ts">
	import { ref } from 'vue';
	import LangMenu from './LanguageMenu.vue';
	import setting from './setting_button.vue'
	let UserCookie = ''; 

	const props = defineProps<{
		setLanguage: (lang: string) => void;
		isConnect: boolean;
	}>();
	const emit = defineEmits(['show-form', 'show_setting']);

	const handleButtonClick = () => {
		if (props.isConnect)
			logout();
		emit('show-form');
	};

	const logout = async function logoutUser() {
		try {
			const response = await fetch(`http://${window.location.hostname}:3000/logout` , {
				method :'GET',
				credentials: 'include'
			});

			if (response.ok)

				console.log("Deconnexion");
			else 
				console.log("Erreur de connexion");
		} catch (err) {
				console.error("Erreur de deconnexion:", err);
		}
	};

	const handleShowPage = (pageName: string) => {
		console.log(pageName)
		emit('show_setting', pageName);
	}
</script>

<template>
	<header class="header">
		<h1 class="logo">FT_TRANSCENDENCE</h1>
		<div class="end-button" data-ignore-outside>
			<button @click=handleButtonClick  class="my-button" title="sign_up" >
				<div v-show="!isConnect" data-i18n="header.signUp"></div>
				<div v-show="isConnect" data-i18n="header.signOut"></div>
			</button>
			<lang-menu :setLanguage="props.setLanguage"></lang-menu>
			<setting @show_setting="handleShowPage" v-show="isConnect" :setLanguage="props.setLanguage"></setting>
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
		align-items:center;
		padding: 1rem 3rem;
	}

	.end-button{
		display: flex;
		justify-content: end;
		align-items: stretch;
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
	/*	margin-top: 0.5rem;*/
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
		/* margin-left: 1.5rem; */
		font-size: 5rem;
		/* margin-top: 1.4rem; */
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #ff69b4,
		0 0 120px #dd0aba;
		position: relative;
		margin: 0;
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

	@media (max-width: 1200px) {
		.header {
			padding: 1rem 2rem;
		}
		.logo {
			font-size: 3.3rem;
		}
		.logo::after {
			width: 27rem;
		}
		.my-button {
			font-size: 1.6rem;
			padding: 0.8rem 1.5rem;
		}
	}

	@media (max-width: 768px) {
		.header {
			flex-direction: column;
			align-items: center;
			gap: 2rem;
			padding: 1.5rem 1rem;
		}

		.logo {
			text-align: center;
			font-size: 3rem;
		}

		.logo::after {
			width: 100%;
			left: 50%;
			transform: translateX(-50%);
		}

		.end-button {
			justify-content: center;
			margin: 0;
			width: 100%;
			font-size: 2rem;
		}

	}
	
</style>