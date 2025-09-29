<script setup lang="ts">
import { onMounted, ref, nextTick, watch, computed, onUnmounted } from "vue"
import type { Ref } from "vue"
import play from "./tournament_playable_page.vue"
import demi from "./4P_demi_final.vue"
import { setLanguage, updateText } from '../../../service/translators';
import { all } from "axios";

const props = defineProps<{
		setLanguage: (lang: string) => void;
		order_for_matches: Array<string>
	}>();

onMounted(async () => {
	await nextTick()
	updateText()
})

const OnMatch = ref(false);
const allMatch = ref(false);
const demif = ref(false);

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

const third_match: rslt_match = {
	winner: ref<string>(""),
	loser: ref<string>(""),
}

const fourth_match: rslt_match = {
	winner: ref<string>(""),
	loser: ref<string>(""),
}

const list_demi = ref(["","","",""])


const runDemi = () => {
	demif.value = true;
}

let act_match= ref(['','']);

const handleRslt = (winner: string, loser: string) => {
	if (!first_match.winner.value){
		first_match.loser.value = loser;
		first_match.winner.value = winner;
		list_demi.value[0] = winner;
	}
	else if (!seconde_match.winner.value){
		seconde_match.loser.value = loser;
		seconde_match.winner.value = winner;
		list_demi.value[1] = winner;
	}
	else if (!third_match.winner.value){
		third_match.loser.value = loser;
		third_match.winner.value = winner;
		list_demi.value[2] = winner;
	}
	else if (!fourth_match.winner.value){
		fourth_match.loser.value = loser;
		fourth_match.winner.value = winner;
		list_demi.value[3] = winner;
	}
	OnMatch.value = false;
	if (list_demi.value.every(player => player !== "")) {
		allMatch.value = true;
	}
};

const chooseMatches = () =>{
	console.log("chooseMatches appelée");
	if (!first_match.winner.value) {
		act_match.value[0] = props.order_for_matches[0]
		act_match.value[1] = props.order_for_matches[1]
	} else if (!seconde_match.winner.value) {
		act_match.value[0] = props.order_for_matches[2]
		act_match.value[1] = props.order_for_matches[3]
	} else if (!third_match.winner.value) {
		act_match.value[0] = props.order_for_matches[4]
		act_match.value[1] = props.order_for_matches[5]
	} else if (!fourth_match.winner.value) {
		act_match.value[0] = props.order_for_matches[6]
		act_match.value[1] = props.order_for_matches[7]
	}
	OnMatch.value = true;
}



</script>

<template>
	<div v-show="!OnMatch && !demif" title="quart_final_container" class="demi_final_container">
		<div title="q_f_title" class="d_f_title" data-i18n="tournament.quart final"></div>
		<div title="matches_container" class="e_matches_container">
			<div title="first_match" class="match_container">
				<div title="label_match" class="label_match" data-i18n="tournament.first_match"></div>
				<div v-show="!first_match.winner.value || props.order_for_matches[0] !== first_match.loser.value" title="player1" class="player">{{ props.order_for_matches[0] }}</div>
				<div v-show="first_match.winner.value && props.order_for_matches[0] === first_match.loser.value" title="player1" class="l_player">{{ props.order_for_matches[0] }}</div>
				<div title="VERSUS" class="versus">VS</div>
				<div v-show="!first_match.winner.value || props.order_for_matches[1] !== first_match.loser.value" title="player2" class="player">{{ props.order_for_matches[1] }}</div>
				<div v-show="first_match.winner.value && props.order_for_matches[1] === first_match.loser.value" title="player2" class="l_player">{{ props.order_for_matches[1] }}</div>
			</div>
			<div title="second_match" class="match_container">
				<div title="label_match" class="label_match" data-i18n="tournament.seconde_match"></div>
				<div v-show="!seconde_match.winner.value || props.order_for_matches[2] !== seconde_match.loser.value" title="player3" class="player">{{ props.order_for_matches[2] }}</div>
				<div v-show="seconde_match.winner.value && props.order_for_matches[2] === seconde_match.loser.value" title="player3" class="l_player">{{ props.order_for_matches[2] }}</div>
				<div title="VERSUS" class="versus">VS</div>
				<div v-show="!seconde_match.winner.value || props.order_for_matches[3] !== seconde_match.loser.value" title="player4" class="player">{{ props.order_for_matches[3] }}</div>
				<div v-show="seconde_match.winner.value && props.order_for_matches[3] === seconde_match.loser.value" title="player4" class="l_player">{{ props.order_for_matches[3] }}</div>
			</div>
			<div title="third_match" class="match_container">
				<div title="label_match" class="label_match" data-i18n="tournament.third_match"></div>
				<div v-show="!third_match.winner.value || props.order_for_matches[4] !== third_match.loser.value" title="player5" class="player">{{ props.order_for_matches[4] }}</div>
				<div v-show="third_match.winner.value && props.order_for_matches[4] === third_match.loser.value" title="player5" class="l_player">{{ props.order_for_matches[4] }}</div>
				<div title="VERSUS" class="versus">VS</div>
				<div v-show="!third_match.winner.value || props.order_for_matches[5] !== third_match.loser.value" title="player6" class="player">{{ props.order_for_matches[5] }}</div>
				<div v-show="third_match.winner.value && props.order_for_matches[5] === third_match.loser.value" title="player6" class="l_player">{{ props.order_for_matches[5] }}</div>
			</div>
			<div title="fourth_match" class="match_container">
				<div title="label_match" class="label_match" data-i18n="tournament.fourth_match"></div>
				<div v-show="!fourth_match.winner.value || props.order_for_matches[6] !== fourth_match.loser.value" title="player7" class="player">{{ props.order_for_matches[6] }}</div>
				<div v-show="fourth_match.winner.value && props.order_for_matches[6] === fourth_match.loser.value" title="player7" class="l_player">{{ props.order_for_matches[6] }}</div>
				<div title="VERSUS" class="versus">VS</div>
				<div v-show="!fourth_match.winner.value || props.order_for_matches[7] !== fourth_match.loser.value" title="player8" class="player">{{ props.order_for_matches[7] }}</div>
				<div v-show="fourth_match.winner.value && props.order_for_matches[7] === fourth_match.loser.value" title="player8" class="l_player">{{ props.order_for_matches[7] }}</div>
			</div>
		</div>
		<button @click="chooseMatches()" v-show="!first_match.winner.value && !seconde_match.winner.value && !third_match.winner.value && !fourth_match.winner.value && !allMatch" title="start" class="match_button">
			<div data-i18n="tournament.first_match"></div>
		</button>
		<button @click="chooseMatches()" v-show="first_match.winner.value && !seconde_match.winner.value && !third_match.winner.value && !fourth_match.winner.value && !allMatch" title="start" class="match_button">
			<div data-i18n="tournament.seconde_match"></div>
		</button>
		<button @click="chooseMatches()" v-show="first_match.winner.value && seconde_match.winner.value && !third_match.winner.value && !fourth_match.winner.value && !allMatch" title="start" class="match_button">
			<div data-i18n="tournament.third_match"></div>
		</button>
		<button @click="chooseMatches()" v-show="first_match.winner.value && seconde_match.winner.value && third_match.winner.value && !fourth_match.winner.value && !allMatch" title="start" class="match_button">
			<div data-i18n="tournament.fourth_match"></div>
		</button>
		<button @click="runDemi()" v-show="allMatch" title="start" class="match_button">
			<div data-i18n="tournament.semi final"></div>
		</button>
	</div>
	<play
			v-if="OnMatch"
			:act_match="act_match" 
			:setLanguage="props.setLanguage" 
			@match_rslt="handleRslt"
	></play>
	<demi v-if="demif" :order_for_matches="list_demi" :setLanguage="props.setLanguage"></demi>
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

.e_matches_container{
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
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

.l_player{
	font-family: netron;
	font-weight: bold;
	color: rgb(170, 152, 152);
	text-align: center;
	text-shadow: 
	0 0 10px #41403bf6,
	0 0 10px #41403bf6,
	0 0 20px #41403bf6,
	0 0 40px #41403bf6;
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

.victory_container{
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
</style>