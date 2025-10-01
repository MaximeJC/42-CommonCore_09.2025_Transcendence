<script setup lang="ts">

import { USER_MANAGEMENT_URL } from '@/config/config.js';
import { ref, onMounted, nextTick } from 'vue';
import { setLanguage, updateText } from '../../service/translators';
import { user } from '../../user';
	
const { currentUser } = user();

const props = defineProps<{
	setLanguage: (lang: string) => void;
}>();

onMounted(async () => {
	await nextTick()
	updateText()
})

interface Match{
	win: boolean;
	date: string | number;
	c_login: string;
	score_c: number;
	o_login: string;
	score_o: number;
}

const matches = ref<Match[]>([]);

function formatDate(date: string | number): string {
	// Si `date` est un nombre (timestamp en secondes), le convertir en millisecondes
	const dateObj = typeof date === 'number' ? new Date(date * 1000) : new Date(date);

	const day = String(dateObj.getDate()).padStart(2, '0');
	const month = String(dateObj.getMonth() + 1).padStart(2, '0');
	const hours = String(dateObj.getHours()).padStart(2, '0');
	const minutes = String(dateObj.getMinutes()).padStart(2, '0');
	
	return `${day}/${month} - ${hours}:${minutes}`;
}

async function fetchMyGames() {
	try {
		if (currentUser.value) {
			const login = currentUser.value.login;
			
			const result = await fetch(`${USER_MANAGEMENT_URL}/games/me?login_current=${encodeURIComponent(login)}`);
			if (!result.ok) {
				throw new Error(`Erreur: ${result.status}`);
			}
			const games = await result.json();

			matches.value = games.map((game: any) => ({
				win: game.login_winner === login,
				date: game.created_at,
				c_login: login,
				score_c: game.login_winner === login ? game.score_winner : game.score_loser,
				score_o: game.login_winner === login ? game.score_loser : game.score_winner,
				o_login: game.login_winner === login ? game.login_loser : game.login_winner,
			}));
			// console.log("Parties recuperees (historic.vue).");

		} else {
			matches.value = [];
		}
	} catch (err) {
		console.error("Erreur de recuperation des parties:", err);
	}
}
onMounted(()=>{ fetchMyGames() });

</script>

// const matchs: match[] = [
// 	{win: true, c_login: "Micka", score_c: 5, date: 2.50, score_o: 2, o_login: "nico"},
// 	{win: true, c_login: "Micka", score_c: 5, date: 3.55, score_o: 3, o_login: "Louise"},
// 	{win: true, c_login: "Micka", score_c: 5, date: 2.12, score_o: 4, o_login: "Maxime"},
// 	{win: false, c_login: "Micka", score_c: 4, date: 2.37, score_o: 5, o_login: "Axel"},
// 	{win: true, c_login: "Micka", score_c: 5, date: 2.10, score_o: 4, o_login: "Thomas"},
// 	{win: true, c_login: "Micka", score_c: 5, date: 1.40, score_o: 0, o_login: "Anas"},
// 	{win: true, c_login: "Micka", score_c: 5, date: 2.12, score_o: 3, o_login: "Arthur"},
// 	{win: false, c_login: "Micka", score_c: 0, date: 2.43, score_o: 5, o_login: "Dorina"},
// 	{win: true, c_login: "Micka", score_c: 5, date: 1.55, score_o: 2, o_login: "wictor"},
// 	{win: false, c_login: "Micka", score_c: 1, date: 2.33, score_o: 5, o_login: "yichi"},
// ];

<template>
	<div class="historic-container">
		<div class="title" data-i18n="historic.historic"></div>
		<div title="historic_header" class="h-grid-header">
			<div data-i18n="historic.victory"></div>
			<div data-i18n="historic.login"></div>
			<div data-i18n="historic.my_score"></div>
			<div data-i18n="historic.time"></div>
			<div data-i18n="historic.o_score"></div>
			<div data-i18n="historic.o_login"></div>
		</div>
		<div class="list-container">
			<div v-for="match in matches" :key="match.score_c" class="h-grid-row">
				<div class="v-icon">
					<img class="h-v-icon" v-show="match.win" src="/images/v-green.png"></img>
					<img class="h-d-icon" v-show="!match.win" src="/images/cross-red.png"></img>
				</div>
				<div>{{ match.c_login }}</div>
				<div>{{ match.score_c }}</div>
				<div>{{ formatDate(match.date) }} </div>
				<div>{{ match.score_o }}</div>
				<div>{{ match.o_login }}</div>
			</div>
		</div>
	</div>
</template>

<style>
	.historic-container{
		display: grid;
		grid-template-rows: 0.2fr 0.1fr 1fr;
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

	.title{
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

	.historic-container > div:not(.title) {
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
		align-items: start;
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
		display: inline-block;   /* nécessaire pour gérer la largeur */
		width: 7ch;              /* largeur équivalente à ~6 caractères */
		overflow: hidden;        /* coupe ce qui dépasse */
		white-space: nowrap;     /* empêche le retour à la ligne */
		text-overflow: ellipsis; /* ajoute "…" à la fin si coupé */
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