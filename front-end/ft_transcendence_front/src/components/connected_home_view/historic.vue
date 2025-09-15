<script setup lang="ts">
	import { ref, onMounted, defineExpose } from 'vue';
	const props = defineProps<{
			setLanguage: (lang: string) => void;
	}>();


	interface Match{
		date : number;
		winner: string;
		score_w: number;
		loser: number;
		score_l: string;
	}

	const matches = ref<Match[]>([]);

	async function fetchGames() {
		try {
			const result = await fetch('http://localhost:3000/games');
			if (!result.ok)
				throw new Error(`Erreur http: ${result.status}`);
			const games = await result.json();

			matches.value = games.map((game: any)=>({
				date: game.created_at,
				winner: game.login_winner,
				score_w: game.score_winner,
				score_l: game.score_loser,
				loser: game.login_loser,

			}));
		} catch (err) {
			console.error("Erreur de recuperation des parties:", err);
		}
		onMounted(()=>{ fetchGames(); });
	}

	// const matchs: match[] = [
	// 	{win: true, winner: "Micka", score_w: 5, date: 2.50, score_l: 2, loser: "nico"},
	// 	{win: true, winner: "Micka", score_w: 5, date: 3.55, score_l: 3, loser: "Louise"},
	// 	{win: true, winner: "Micka", score_w: 5, date: 2.12, score_l: 4, loser: "Maxime"},
	// 	{win: false, winner: "Micka", score_w: 4, date: 2.37, score_l: 5, loser: "Axel"},
	// 	{win: true, winner: "Micka", score_w: 5, date: 2.10, score_l: 4, loser: "Thomas"},
	// 	{win: true, winner: "Micka", score_w: 5, date: 1.40, score_l: 0, loser: "Anas"},
	// 	{win: true, winner: "Micka", score_w: 5, date: 2.12, score_l: 3, loser: "Arthur"},
	// 	{win: false, winner: "Micka", score_w: 0, date: 2.43, score_l: 5, loser: "Dorina"},
	// 	{win: true, winner: "Micka", score_w: 5, date: 1.55, score_l: 2, loser: "wictor"},
	// 	{win: false, winner: "Micka", score_w: 1, date: 2.33, score_l: 5, loser: "yichi"},
	// ];
</script>

<template>
	<div class="historic-container">
		<div class="tittle" data-i18n="historic.historic"></div>
		<div tittle="historic_header" class="h-grid-header">
			<div data-i18n="historic.victory"></div>
			<div data-i18n="historic.login"></div>
			<div data-i18n="historic.my_score"></div>
			<div data-i18n="historic.date"></div>
			<div data-i18n="historic.score_l"></div>
			<div data-i18n="historic.loser"></div>
		</div>
		<div class="list-container">
			<div v-for="match in matches" :key="match.score_w" class="h-grid-row">
				<!-- <div class="v-icon">
					<img class="h-v-icon" v-show="match.win" src="../../../images/v-green.png"></img>
					<img class="h-d-icon" v-show="!match.win" src="../../../images/cross-red.png"></img>
				</div> -->
				<div>{{ match.winner }}</div>
				<div>{{ match.score_w }}</div>
				<div>{{ match.date }} min </div>
				<div>{{ match.score_l }}</div>
				<div>{{ match.loser }}</div>
			</div>
		</div>
	</div>
</template>

<style>
	.historic-container{
		display: grid;
		grid-template-rows: min-content;
		grid-template-columns: 1fr;
		width:auto;
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

	.tittle{
		display: block;
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
		align-self: center;
		margin-bottom: 0.5rem;
		text-align: center;
	}

	.historic-container > div:not(.tittle) {
		color: white;
		font-size: 1.5rem;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba;
	}

	.list-container{
		overflow: auto;	
		border-bottom: 1px solid #ddd;
		scrollbar-color: #dd0aba transparent;
	}

	.h-grid-row, .h-grid-header{
		display: grid;
		grid-template-columns: 0.5fr 1fr 0.5fr 1fr 0.5fr 1fr;
		text-align: center;
		align-items: center;
		border-bottom: 1px solid #ddd;
		padding: 3px;
	}	
	.h-grid-header > div{
		color: white;
		font-size: 1rem;
		text-shadow: 
		0 0 10px #18c3cf,
		0 0 20px #18c3cf,
		0 0 40px #18c3cf;
	}

	.h-grid-row > div{
		padding: 0.4rem;
	}

	.v-icon{
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.h-v-icon{
		width: 1.5rem;
		height: 1.5rem;
	}
	.h-d-icon{
		width: 2rem;
		height: 2rem;
	}
</style>