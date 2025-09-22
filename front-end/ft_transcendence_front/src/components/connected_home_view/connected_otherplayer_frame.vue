<script setup lang="ts">

import { ref, onMounted, defineProps } from 'vue';
import play_historic from "./play&historic_button.vue";
import play_return from "./play&return_button.vue";
import invit_return from "./invit&return_button.vue";
import { watch } from 'vue';

const emit = defineEmits(['showOtherPlayer']);


const props = defineProps<{
		setLanguage: (lang: string) => void;
		other_player: boolean;
		selectedPlayerLogin: string | null;
}>();


const playerData = ref({
	login: '',
	avatar_url: '',
	nb_games: 0,
	nb_won_games: 0,
	rank: 0,
});

async function fetchOtherPlayerData(otherPlayerLogin: string) {
	try {
		const response = await fetch(`http://${window.location.hostname}:3000/users/specificlogin?login=${otherPlayerLogin}`);
		if (!response.ok)
			throw new Error('Player data fetch error');

		const data = await response.json();
		console.log(data);
		playerData.value = {
			login: data.login,
			avatar_url: data.avatar_url,
			nb_games: data.nb_games,
			nb_won_games: data.nb_won_games,
			rank: data.rank,
		};
		console.log(playerData);
	} catch (error) {
		console.log("Error:", error);
	}
}

watch(
    () => props.selectedPlayerLogin,
    (newLogin) => {
        if (newLogin)
            fetchOtherPlayerData(newLogin);
    },
    { immediate: true }
);

/* async function fetchPlayerData(retries = 5, delay = 1000) {
	try {
		for (let i = 0; i < retries; i++) {
			const response = await fetch(`http://${window.location.hostname}:3000/me`, {
				method: 'GET',
				credentials: 'include'
			});
			if (response.ok) {
				const data = await response.json();
				// Si user est présent, on peut sortir
				if (data.user && data.user.login) {
					playerData.value = {
						login: data.user.login,
						nb_games: data.user.nb_games,
						nb_won_games: data.user.nb_won_games,
						rank: data.user.rank
					};
					return;
				}
			}
			// Attendre avant de réessayer
			await new Promise(res => setTimeout(res, delay));
		}
		// console.warn("User non trouvé après plusieurs tentatives.");
		// playerData.value = null;
	} catch (error) {
		console.error("Erreur dans fetchPlayerData:", error);
		// playerData.value = null;
	}
}
onMounted(async()=>{ await fetchPlayerData(); }); */

</script>

<template>
	<div  tittle="connected_player_frame" class="connected_player_frame">
		<div class="avatar+login">
			<img :src="playerData.avatar_url" alt="Avatar" class="avatar">
			<div title="login" class="login">{{ playerData.login }}</div>
		</div>
		<div class="stat-container">
			<div title="nbr-game" class="label_stat" data-i18n="player_stat.nbr_games"></div>
			<div title="nbr_game_stat" class="stat" >{{ playerData.nb_games }}</div>
			
		</div>
		<div class="stat-container">
			<div title="nbr-victory" class="label_stat" data-i18n="player_stat.nbr_victory"></div>
			<div title="nbr-victory_stat" class="stat" >{{ playerData.nb_won_games }}</div>
			
		</div>
		<div class="stat-container">
			<div title="rank" class="label_stat" data-i18n="player_stat.rank"></div>
			<div title="rank_stat" class="stat" >{{ playerData.rank }}</div>
		</div>
		<invit_return @showOtherPlayer="emit('showOtherPlayer')" :setLanguage="props.setLanguage" ></invit_return>
	</div>
</template>

<style>
	@font-face {
	font-family: "netron";
	src: url("../../fonts/netron.regular.otf") format("opentype");
	}

	.connected_player_frame{
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 51rem;
		background-color: rgba(156, 50, 133, 0.5);
		border: 2px solid #e251ca;
		box-shadow: 
		0 0 5px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba;
		padding: 1rem 2rem;
		border-radius: 20px;
	}

	.avatar\+login{
		display: flex;
		flex-direction: column;
		margin-right: 1rem;
	}
	
	.avatar{
		width: 6.5rem;
		height: 6.5rem;
		border-radius: 50%;
		border:3px solid #ffffff;
		box-shadow: 
		0 0 10px #dd0aba,
		0 0 20px #dd0aba;
	}

	.login{
		display: flex;
		align-self: center;
		justify-content: center;
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
		margin-top: 1rem;
	}

	.stat-container{
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0px 1rem;
	}

	.label_stat{
		font-family: netron;
		color: white;
		font-weight: bold;
		text-shadow: 
		0 0 10px #18c3cf, 
		0 0 20px #18c3cf;
		font-size: 1.5rem;
		font-family: netron;
		color: white;
		margin-bottom: 1rem;
	}

	.stat{
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: netron;
		width: 5rem;
		height: 5rem;;
		border-radius: 50%;
		font-size: 2.3rem;
		font-weight: bold;
		border: 5px solid #fffffd;
		color: white;
		box-shadow: 
		0 0 10px #dd0aba,
		0 0 30px #dd0aba;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba;
	}

	
</style>