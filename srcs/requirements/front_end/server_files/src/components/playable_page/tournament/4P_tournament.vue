<script setup lang="ts">
import { onMounted, ref, nextTick, watch, computed } from "vue"
import type { Ref } from "vue"
import { setLanguage, updateText } from '../../../service/translators';

import demi_final from "./4P_demi_final.vue"

onMounted(async () => {
	await nextTick()
	updateText()
})

const props = defineProps<{
		setLanguage: (lang: string) => void;
	}>();

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

const player1 = ref('');
const player2 = ref('');
const player3 = ref('');
const player4 = ref('');

// Array avec tous les joueurs pour faciliter la gestion
const allPlayers = computed(() => [
  player1.value, player2.value, player3.value, player4.value
]);

// Array avec tous les statuts de duplication
const duplicateStatuses = computed(() => {
  return allPlayers.value.map((currentPlayer, currentIndex) => {
    if (currentPlayer.trim() === '') return false;
    
    return allPlayers.value.some((otherPlayer, otherIndex) => 
      otherIndex !== currentIndex && 
      otherPlayer.trim() === currentPlayer.trim()
    );
  });
});

// Computed individuels pour chaque joueur (utilisant la fonction commune)
const isDuplicate1 = computed(() => duplicateStatuses.value[0]);
const isDuplicate2 = computed(() => duplicateStatuses.value[1]);
const isDuplicate3 = computed(() => duplicateStatuses.value[2]);
const isDuplicate4 = computed(() => duplicateStatuses.value[3]);

const list_of_players = ref(["","","",""])
const order_for_matches = ref(["","","",""])
function handleSubmit(e: Event) {
	e.preventDefault();
	const inputs = document.querySelectorAll<HTMLInputElement>('.add_players_login input');
	list_of_players.value = Array.from(inputs).map(input => input.value.trim());
	order_for_matches.value = shuffleArray(list_of_players.value);
	showDemiFinal.value = true;
}

const showDemiFinal = ref(false);



</script>

<template>
	<form v-if="!showDemiFinal" class="four_player_frame">
		<div class="title">Choissisez vos pseudo</div>
		<div title="add_players_login" class="add_players_login">
			
			<div title="player1" class="player_title">
				<div data-i18n="tournament.player 1"></div>
				<input title="player1" v-model='player1' :class="{ error: isDuplicate1 }" maxlength="13"></input>
				<div v-show="isDuplicate1" class="error-message" data-i18n="tournament.error_pseudo"></div>
			</div>
			<div title="player2" class="player_title">
				<div data-i18n="tournament.player 2"></div>
				<input title="player2" v-model='player2' :class="{ error: isDuplicate2 }" maxlength="13"></input>
				<div v-show="isDuplicate2" class="error-message" data-i18n="tournament.error_pseudo"></div>
			</div>
			<div title="player3" class="player_title">
				<div data-i18n="tournament.player 3"></div>
				<input title="player3" v-model='player3' :class="{ error: isDuplicate3 }" maxlength="13"></input>
				<div v-show="isDuplicate3" class="error-message" data-i18n="tournament.error_pseudo"></div>
			</div>
			<div title="player4" class="player_title">
				<div data-i18n="tournament.player 4"></div>
				<input title="player4" v-model='player4' :class="{ error: isDuplicate4 }" maxlength="13"></input>
				<div v-show="isDuplicate4" class="error-message" data-i18n="tournament.error_pseudo"></div>
			</div>
		</div>
		<button @click="handleSubmit" type="button" title="Submit-button" class=" t_Submit-button">
			<div data-i18n="Signup.submit"></div>
		</button>
	</form>
	<demi_final v-if="showDemiFinal" :order_for_matches="order_for_matches" :setLanguage="props.setLanguage"></demi_final>
</template>

<style>
.four_player_frame{
	display: grid;
	grid-template-rows: max-content;
	grid-template-columns: 1fr;
	justify-content: center;
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

.title{
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
}



.add_players_login{
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr 1fr;
	margin-bottom: 3rem;
	gap: 1rem;
	margin-top: 1rem
}

.player_title {
    display: grid;
    gap: 0.5rem;
    grid-template-rows: max content;
    grid-template-columns: 1fr;
    font-family: netron;
    font-weight: bold;
    color: white;
    text-shadow: 
    0 0 10px #dd0aba,
    0 0 10px #dd0aba,
    0 0 20px #dd0aba;
    font-size: 1.5rem;
    margin-top: 1rem;
    
    /* C'est la ligne qui fait la différence */
    justify-items: center; 

    align-items: center; 
}
.player_title > input{
	width: 10rem;
	font-size: 1.8rem;
	border-radius: 20px;
	border: none;
}

.player1{
	font-size: 1.8rem;
	 color: 18c3cf;
    text-shadow: 
    0 0 10px #18c3cf,
    0 0 10px #18c3cf,
    0 0 20px #18c3cf;
}

.t_Submit-button{
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
	padding: 0.2rem 1.3rem;
	border-radius: 20px;
	cursor: pointer;
	transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
}

.t_Submit-button > div{
	margin-top:  1rem;
	margin-bottom:  0.5rem;
}

.T_Submit-button:hover{
	background-color: #dd0abacc ;

	border: 2px solid #dd0aba;
	box-shadow: 
	0 0 5px #dd0aba,
	0 0 10px #dd0aba,
	0 0 20px #dd0aba,
	0 0 40px #dd0aba,
	0 0 80px #dd0aba;
	text-shadow: 
	0 0 5px #dd0aba,
	0 0 10px #dd0aba,
	0 0 20px #dd0aba,
	0 0 40px #dd0aba,
	0 0 80px #dd0aba;
}

.error {
  border: 2px solid red;
  background-color: #ffe6e6;
}

.error-message {
  color: #dc3545;
  font-size: 0.8em;
  margin-top: 0.25rem;
  font-weight: 500;
  text-shadow: none;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>