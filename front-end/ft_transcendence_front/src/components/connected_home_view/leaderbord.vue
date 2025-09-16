<script setup lang="ts">

	import { ref, onMounted, defineExpose } from 'vue';
	const props = defineProps<{
			setLanguage: (lang: string) => void;
	}>();

	const emit = defineEmits(['show-other_player']);


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

	const players = ref<Player[]>([]);

	async function getPlayers() {
		try {
			const response = await fetch(`http://${window.location.hostname}:3000/leaderboard`);
			if (!response.ok)
				throw new Error(`HTTP error! status: ${response.status}`);
			const data = await response.json();
            players.value = data.map((player: any) => ({
					rank: player.rank,
					name: player.name,
					games: player.games,
					victory: player.victory,
            }));
		} catch (error) {
			console.log("Erreur de recuperation du classement des joueurs");
			// const players: Player[] = [
			// 	{ rank: 1, name: "Micka", games: 200, victory: 180},
			// 	{ rank: 2, name: "Louise", games: 180, victory: 160},
			// 	{ rank: 3, name: "Maxime", games: 150, victory: 130},
			// 	{ rank: 4, name: "Axel", games: 135, victory: 112},
			// 	{ rank: 5, name: "Nico", games: 120, victory: 105},
			// 	{ rank: 6, name: "Thomas", games: 30, victory: 22},
			// 	{ rank: 7, name: "Anas", games: 20, victory: 14},
			// 	{ rank: 8, name: "Arthur", games: 10, victory: 6},
			// 	{ rank: 9, name: "Dorina", games: 5, victory: 2},
			// 	{ rank: 10, name: "Wictor", games: 2, victory: 1},
			// ];
		}
	}
	onMounted(()=>{ getPlayers() });
</script>

<template>
	<div ref="rootElement" title="leaderbord frame" class="leaderboard-container">
		<div class="title-leaderbord" data-i18n="home_player_button.Leaderbord"></div>
		<div title="leaderbord-header" class="grid-header">
			<div class="sub1" data-i18n="player_stat.rank"></div>
			<div class="sub1">Login</div>
			<div class="sub1" data-i18n="player_stat.nbr_games"></div>
			<div class="sub2" data-i18n="player_stat.nbr_victory"></div>
		</div>
		<div class="lead-list-container">
			<div v-for="player in players" :key="player.rank" class="grid-row">
				<div class="stat1">{{ player.rank}}</div>
				<button @click="emit('show-other_player')" class="name-button">{{ player.name }}</button>
				<div class="stat2">{{ player.games }}</div>
				<div class="stat2">{{ player.victory }}</div>
			</div>
		</div>
	</div>
</template>

<style>

.leaderboard-container{
		display: grid;
		grid-template-rows: min-content;
		grid-template-columns: 1fr;
		width: auto;
		align-content: flex-start;
		height: 26rem;
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

	.title-leaderbord{
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

	.lead-list-container{
		margin-top: 1rem;
		overflow: auto;
		height: 100%;
		scrollbar-color: #dd0aba transparent;
	}

	.grid-row{
		display: grid;
		grid-template-columns: 0.1fr 1fr 0.2fr 0.3fr;
		padding: 3px;
		border-bottom: 1px solid #ddd;
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
		/*justify-content: ;*/
	}	

	.grid-header{
		display: grid;
		grid-template-columns: 0.1fr 1fr 0.2fr 0.3fr;
		padding: 3px;
		border-bottom: 1px solid #ddd;
		/*justify-content: ;*/
	}	
	.grid-header > div{
		color: white;
		font-size: 1rem;
		text-shadow: 
		0 0 10px #18c3cf,
		0 0 20px #18c3cf,
		0 0 40px #18c3cf;
	}

	.sub1{
		text-align: start;
		margin-right: 2rem;
	}
	.sub2{
		text-align: end;

	}
	.stat1{
		text-align: center;
		font-size: 1.5rem;

	}

	.stat2{
		text-align: end;
		font-size: 1.5rem;

	}

	.name-button{
		border: none;
		color: white;
		font-size: 1.5rem;
		text-align: start;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #dd0aba;
		background: transparent;
		cursor: pointer;
		margin-left: 2.5rem;
		transition: background-color 0.3s ease-in-out, border 0.3s ease-in-out, box-shadow 0.3 ease-in-out;
	}

	.name-button:hover{
		text-shadow: 
		0 0 10px #fbff22,
		0 0 20px #fbff22,
		0 0 40px #fbff22;
	}
</style>