<script setup lang="ts">
	import { ref, onMounted, defineExpose } from 'vue';
	const props = defineProps<{
			setLanguage: (lang: string) => void;
	}>();

	const rootElement = ref<HTMLElement | null>(null);

	defineExpose({
		rootElement
	});

	interface Player {
		rank: number;
		name: string;
		games: number;
		victory: number;
	}


	const players: Player[] = [
  		{ rank: 1, name: "Micka", games: 200, victory: 180},
		{ rank: 2, name: "Louise", games: 180, victory: 160},
		{ rank: 3, name: "Maxime", games: 150, victory: 130},
		{ rank: 4, name: "Axel", games: 135, victory: 112},
		{ rank: 5, name: "Nico", games: 120, victory: 105},
		{ rank: 6, name: "Thomas", games: 30, victory: 22},
		{ rank: 7, name: "Anas", games: 20, victory: 14},
		{ rank: 8, name: "Arthur", games: 10, victory: 6},
		{ rank: 9, name: "Dorina", games: 5, victory: 2},
		{ rank: 10, name: "Wictor", games: 2, victory: 1},
	];

	

</script>

<template>
	<div ref="rootElement" title="leaderbord frame" class="leaderboard-container">
		<div class="tittle-leaderbord" data-i18n="home_player_button.Leaderbord"></div>
		<div tittle="leaderbord-header" class="grid-header">
			<div data-i18n="player_stat.rank"></div>
			<div>Login</div>
			<div data-i18n="player_stat.nbr_games"></div>
			<div data-i18n="player_stat.nbr_victory"></div>
		</div>
		<div v-for="player in players" :key="player.rank" class="grid-row">
			<div>{{ player.rank}}</div>
			<div>{{ player.name }}</div>
			<div>{{ player.games }}</div>
			<div>{{ player.victory }}</div>
		</div>
	</div>
</template>

<style>

.leaderboard-container{
		display: grid;
		grid-template-rows: min-content;
		grid-template-columns: 1fr;
		width: auto;
		height: auto;
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

	.tittle-leaderbord{
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

	.leaderboard-container > div:not(.tittle-leaderbord) {
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
	}

	.grid-row, .grid-header{
		display: grid;
		grid-template-columns: 0.5fr 1fr 0.5fr 0.5fr;
		padding: 3px;
		border-bottom: 1px solid #ddd;
		justify-content: space-between;
	}	
	.grid-header > div{
		color: white;
		font-size: 1rem;
		text-shadow: 
		0 0 10px #fbff22,
		0 0 10px #fbff22,
		0 0 20px #fbff22,
		0 0 40px #fbff22,
		0 0 80px #fbff22;
	}
</style>