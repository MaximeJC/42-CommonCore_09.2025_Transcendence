<script setup lang="ts">
import { ref } from 'vue';
	const props = defineProps<{
			setLanguage: (lang: string) => void;
		}>();
	const email = ref("");
	const password = ref("");
	const handleConnection = () => {
		//preparation envoie serveur
	}

	const error_email = ref(true);
	const error_password = ref(true);

</script>

<template>
	<div class="frame-connection" title="connection_frame">
		<div class="signUpTitle" tittle="signup_tittle" data-i18n="home.connection"></div>

	</div>
</template>

<style>
	.frame-connection{
		width: 35vw;
    	height: 60vh;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: repeat(auto-fill, minmax(40px, 1fr 1fr));
		gap: 15px;
		justify-content: space-between;
		align-items: flex-start;
		background-color: rgba(156, 50, 133, 0.5);
		border: 2px solid #e251ca;
		box-shadow: 
		0 0 5px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba;
		padding: 20px 40px;
		border-radius: 20px;
		transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
	}

	.subTittle{
		font-family: netron;
		color: white;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #ff69b4,
		0 0 120px #dd0aba;
		font-size: 1.5rem;
		font-family: netron;
		color: white;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #ff69b4,
		0 0 120px #dd0aba;
	}
</style>