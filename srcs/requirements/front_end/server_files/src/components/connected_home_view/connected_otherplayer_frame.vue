<script setup lang="ts">

import { USER_MANAGEMENT_URL } from '@/config/config.js';
import { ref, onMounted } from 'vue';
import play_historic from "./play&historic_button.vue";
import play_return from "./play&return_button.vue";
import invit_return from "./invit&return_button.vue";
import { watch } from 'vue';
import { socket, connectSocket, disconnectSocket } from '@/service/socketService'; // Import le socket

const emit = defineEmits(['showOtherPlayer', 'friend-list-changed']);


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
	connect: 0,
});

async function fetchOtherPlayerData(otherPlayerLogin: string) {
	try {
		const response = await fetch(`${USER_MANAGEMENT_URL}/users/specificlogin?login=${encodeURIComponent(otherPlayerLogin)}`);
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
			connect: data.connected,
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

function handleServerMessage(event: MessageEvent) {
	try {
		const data = JSON.parse(event.data);
		if (data.event === 'friend_update') {
			console.log("Maj liste d'amis recue via WebSocket !", data.payload);
			if (playerData.value.login) {
				fetchOtherPlayerData(playerData.value.login);
			}
		}
	} catch (error) {
		console.error('Erreur de parsing du message WebSocket:', error);
	}
}

watch(socket, (newSocket, oldSocket) => {
	if (oldSocket) {
		oldSocket.removeEventListener('message', handleServerMessage);
	}
	if (newSocket) {
		newSocket.addEventListener('message', handleServerMessage);
	}
});

</script>

<template>
	<div  tittle="connected_player_frame" class="connected_player_frame">
		<div class="avatar+login">
			<img v-if=playerData.avatar_url :src="playerData.avatar_url" alt="Avatar" class="avatar">
			<img v-else  src="/images/default_avatar.png" alt="avatar" class="avatar">
			<div title="login" class="login">
				<div>{{ playerData.login }}</div>
			</div>
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
		<invit_return
		@showOtherPlayer="emit('showOtherPlayer')"
		@friend-list-changed="emit('friend-list-changed')"  
		:selectedPlayerLogin="selectedPlayerLogin"
		:connect="playerData.connect"
		:setLanguage="props.setLanguage" ></invit_return>
	</div>

</template>

<style>
	@font-face {
	font-family: "netron";
	src: url("/fonts/netron.regular.woff2") format("woff2");
	}



	.avatar\+login{
		display: flex;
		flex-direction: column;
		margin-right: 1rem;
	}
	


	
</style>