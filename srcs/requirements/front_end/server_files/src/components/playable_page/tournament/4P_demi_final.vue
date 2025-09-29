<script setup lang="ts">
import { onMounted, ref, nextTick, watch, computed, onUnmounted } from "vue"
import type { Ref } from "vue"
import play from "./tournament_playable_page.vue"
import { setLanguage, updateText } from '../../../service/translators';

const props = defineProps<{
		setLanguage: (lang: string) => void;
		order_for_matches: Array<string>
	}>();

onMounted(async () => {
	await nextTick()
	updateText()
})

const OnMatch = ref(false);

interface rslt_match {
	winner: Ref<string>;
	loser: Ref<string>;
}

const first_match: rslt_match = {
	winner: ref<string>(""),
	loser: ref<string>(""),
}

const seconde_match: rslt_match = {
	winner: ref<string>(""),
	loser: ref<string>(""),
}

const final_match: rslt_match = {
	winner: ref<string>(""),
	loser: ref<string>(""),
}

let act_match= ref(['','']);

const handleRslt = (winner: string, loser: string) => {
	if (!first_match.winner.value){
		first_match.loser.value = loser;
		first_match.winner.value = winner;
	}
	else if(first_match.winner.value && !seconde_match.winner.value){
		seconde_match.loser.value = loser;
		seconde_match.winner.value = winner;
	}
	else if(first_match.winner.value && seconde_match.winner.value){
		final_match.loser.value = loser;
		final_match.winner.value = winner;
	}
	OnMatch.value = false;
};

const chooseMatches = () =>{
	console.log("chooseMatches appelée");
	if (!first_match.winner.value){
		act_match.value[0] = props.order_for_matches[0]
		act_match.value[1] = props.order_for_matches[1]
		console.log("Premier match:", act_match.value);
	}
	else if(first_match.winner.value && !seconde_match.winner.value){
		act_match.value[0] = props.order_for_matches[2]
		act_match.value[1] = props.order_for_matches[3]
		console.log("Deuxième match:", act_match.value);
	}
	else if(first_match.winner.value && seconde_match.winner.value){
		act_match.value[0] = first_match.winner.value
		act_match.value[1] = seconde_match.winner.value
		console.log("Finale:", act_match.value);
	}
	OnMatch.value = true;
}

</script>

<template>
	<div v-show="!OnMatch && !final_match.winner.value" title="demi_final_container" class="demi_final_container">
		<div title="d_f_title" class="d_f_title" data-i18n="tournament.quart final"></div>
		<div title="matches_container"  class="matches_container">
			<div title="first_match" class="match_container">
				<div title="label_match" class="label_match"  data-i18n="tournament.first_match"></div>
				<div title="player1" class="player">{{ props.order_for_matches[0] }}</div>
				<div title="VERSUS" class="versus">VS</div>
				<div title="player2" class="player" >{{ props.order_for_matches[1] }}</div>
			</div>
			<div title="second_match" class="match_container" >
				<div title="label_match" class="label_match"  data-i18n="tournament.seconde_match"></div>
				<div title="player3" class="player">{{ props.order_for_matches[2] }}</div>
				<div title="VERSUS" class="versus">VS</div>
				<div title="player4" class="player">{{ props.order_for_matches[3] }}</div>
			</div>
		</div>
		<button @click="chooseMatches()" v-if="!first_match.winner.value && !seconde_match.winner.value && !final_match.winner.value" title="start" class="match_button">
			<div data-i18n="tournament.first_match"></div>
		</button>
		<button @click="chooseMatches()" v-if="first_match.winner.value && !seconde_match.winner.value && !final_match.winner.value" title="start" class="match_button">
			<div data-i18n="tournament.seconde_match"></div>
		</button>
		<button @click="chooseMatches()" v-if="seconde_match.winner.value && !final_match.winner.value" title="start" class="match_button">
			<div data-i18n="tournament.final"></div>
		</button>
		<play
			v-if="OnMatch"
			:act_match="act_match" 
			:setLanguage="props.setLanguage" 
			@match_rslt="handleRslt"
			></play>
	</div>
	<div v-if="!OnMatch &&  final_match.winner.value" title="victory_container" class="victory_container">
		<div title="victory_label" class="d_f_title" data-i18n="victory.text"></div>
		<div title="victory_login" class="player" data-i18n="victory.text"></div>
		<button @click=""  title="return" class="match_button">
			<div data-i18n="home_player_button.return"></div>
		</button>
	</div>
</template>

<style>
.demi_final_container{
	display: grid;
	grid-template-rows: max-content;
	grid-template-columns: 1fr;
	justify-content: center;
	width: max-content;
	height: max-content;
	gap: 1rem;
	background-color: rgba(156, 50, 133, 0.5);
	border: 2px solid #e251ca;
	box-shadow: 
	0 0 5px #dd0aba,
	0 0 10px #dd0aba,
	0 0 20px #dd0aba,
	0 0 40px #dd0aba;
	margin-top: 5rem;
	border-radius: 20px;
	padding: 3rem 3rem;
}
.d_f_title{
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
	font-size: 3em;
}

.matches_container{
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr;
}
.match_container{
	display: grid;
	grid-template-rows: 1fr 1fr 1fr 1fr;
	grid-template-columns: 1fr;
	gap: 1rem;
	
}

.label_match{
font-family: netron;
	font-weight: bold;
	color: white;
	text-align: center;
	text-shadow: 
	0 0 10px #dd0aba,
	0 0 10px #dd0aba,
	0 0 20px #dd0aba ;

	font-size: 1.5rem;
}
.player{
	font-family: netron;
	font-weight: bold;
	color: white;
	text-align: center;
	text-shadow: 
	0 0 10px #e4d725,
	0 0 10px #e4d725,
	0 0 20px #e4d725,
	0 0 40px #e4d725;
	font-size: 2rem;
}

.versus{
	font-family: netron;
	font-weight: bold;
	color: white;
	text-align: center;

	text-shadow: 
	0 0 10px #0acfdd,
	0 0 10px #0acfdd,
	0 0 20px #0acfdd,
	0 0 40px #0acfdd,
	0 0 80px #0acfdd,
	0 0 120px #0acfdd;
	font-size: 1.5rem;
}

.match_button{
	font-family: netron;
	background-color: rgba(251, 255, 34, 0.502);
	font-size: 2rem;
	text-align: center;
	justify-self: center;
	width: 15rem;
	color: white;
	border: 2px solid #caece8;
	text-shadow: 
	0 0 10px #fbff22,
	0 0 20px #fbff22;
	box-shadow: 
	0 0 5px #fbff22,
	0 0 10px #fbff22,
	0 0 20px #fbff22;
	padding: 1rem 1.3rem;
	border-radius: 20px;
	margin-top: 1rem;
	cursor: pointer;
	justify-content: center;
	transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
}

.match_button > div{
	font-weight:bold;
	
}

.match_button:hover{
	background-color: #dd0abacc ;

	border: 2px solid #dd0aba;
	box-shadow: 
	0 0 5px #dd0aba,
	0 0 10px #dd0aba,
	0 0 20px #dd0aba,
	0 0 40px #dd0aba;
	text-shadow: 
	0 0 5px #dd0aba,
	0 0 10px #dd0aba,
	0 0 20px #dd0aba,
	0 0 40px #dd0aba;
}
</style>