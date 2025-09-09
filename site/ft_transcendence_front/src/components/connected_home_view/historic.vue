<script setup lang="ts">
	import { ref, onMounted, defineExpose } from 'vue';
	const props = defineProps<{
			setLanguage: (lang: string) => void;
	}>();


	interface match{
		win: boolean;
		c_login: string;
		c_score: number;
		time : number;
		o_score: number;
		o_login: string;
	}

	const matchs: match[] = [
		{win: true, c_login: "Micka", c_score: 5, time: 2.50, o_score: 2, o_login: "nico"},
		{win: true, c_login: "Micka", c_score: 5, time: 3.55, o_score: 3, o_login: "Louise"},
		{win: true, c_login: "Micka", c_score: 5, time: 2.12, o_score: 4, o_login: "Maxime"},
		{win: false, c_login: "Micka", c_score: 4, time: 2.37, o_score: 5, o_login: "Axel"},
		{win: true, c_login: "Micka", c_score: 5, time: 2.10, o_score: 4, o_login: "Thomas"},
		{win: true, c_login: "Micka", c_score: 5, time: 1.40, o_score: 0, o_login: "Anas"},
		{win: true, c_login: "Micka", c_score: 5, time: 2.12, o_score: 3, o_login: "Arthur"},
		{win: false, c_login: "Micka", c_score: 0, time: 2.43, o_score: 5, o_login: "Dorina"},
		{win: true, c_login: "Micka", c_score: 5, time: 1.55, o_score: 2, o_login: "wictor"},
		{win: false, c_login: "Micka", c_score: 1, time: 2.33, o_score: 5, o_login: "yichi"},
	];
</script>

<template>
	<div class="historic-container">
		<div class="tittle" data-i18n="historic.historic"></div>
		<div tittle="historic_header" class="h-grid-header">
			<div data-i18n="historic.victory"></div>
			<div data-i18n="historic.login"></div>
			<div data-i18n="historic.my_score"></div>
			<div data-i18n="historic.time"></div>
			<div data-i18n="historic.o_score"></div>
			<div data-i18n="historic.o_login"></div>
		</div>
		<div class="list-container">
			<div v-for="match in matchs" :key="match.c_score" class="h-grid-row">
				<div class="v-icon">
					<img class="h-v-icon" v-show="match.win" src="../../../images/v-green.png"></img>
					<img class="h-d-icon" v-show="!match.win" src="../../../images/cross-red.png"></img>
				</div>
				<div>{{ match.c_login }}</div>
				<div>{{ match.c_score }}</div>
				<div>{{ match.time }} min </div>
				<div>{{ match.o_score }}</div>
				<div>{{ match.o_login }}</div>
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