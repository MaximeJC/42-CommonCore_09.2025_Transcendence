<script setup lang="ts">
import { onMounted, onUnmounted, ref, nextTick, watch, computed } from "vue"
import type { Ref } from "vue"
import quart_final from "./8P_quart_final.vue"
import { setLanguage, updateText } from '../../../service/translators';

const props = defineProps<{
		setLanguage: (lang: string) => void;
	}>();

onMounted(async () => {
	await nextTick()
	updateText()
})

const showQuartFinal = ref(false);

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
const player5 = ref('');
const player6 = ref('');
const player7 = ref('');
const player8 = ref('');

const list_of_players = ref(["","","","","","","",""])
const order_for_matches = ref(["","","","","","","",""])


// Array avec tous les joueurs pour faciliter la gestion
const allPlayers = computed(() => [
  player1.value, player2.value, player3.value, player4.value,
  player5.value, player6.value, player7.value, player8.value
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
const isDuplicate5 = computed(() => duplicateStatuses.value[4]);
const isDuplicate6 = computed(() => duplicateStatuses.value[5]);
const isDuplicate7 = computed(() => duplicateStatuses.value[6]);
const isDuplicate8 = computed(() => duplicateStatuses.value[7]);

const playBox = ref<HTMLElement | null>(null);

function handleSubmit(e: Event) {
	e.preventDefault();
	if (duplicateStatuses.value.some(isDup => isDup)) {
		// Si un pseudo est en double, on ne valide pas
		return;
	}
	const inputs = document.querySelectorAll<HTMLInputElement>('.e_add_players_login input');
	list_of_players.value = Array.from(inputs).map(input => input.value.trim());
	order_for_matches.value = shuffleArray(list_of_players.value);
	showQuartFinal.value = true;
}

</script>

<template>
	<form v-show="!showQuartFinal" class="eight_player_frame">
			<div class="title">Choissisez vos pseudo</div>
			<div title="add_players_login" class="e_add_players_login">
				
				<div title="player1" class="player_title">
					<div data-i18n="tournament.player 1" ></div>
					<input title="player1" v-model='player1' :class="{ error: isDuplicate1 }"  maxlength="13"></input>
					<div v-ifshow="isDuplicate1" class="error-message" data-i18n="tournament.error_pseudo"></div>
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
				<div title="player5" class="player_title">
					<div data-i18n="tournament.player 5"></div>
					<input title="player5" v-model='player5' :class="{ error: isDuplicate5 }" maxlength="13"></input>
					<div v-show="isDuplicate5" class="error-message" data-i18n="tournament.error_pseudo"></div>
				</div>
				<div title="player6" class="player_title">
					<div data-i18n="tournament.player 6"></div>
					<input title="player6" v-model='player6' :class="{ error: isDuplicate6 }" maxlength="13"></input>
					<div v-show="isDuplicate6" class="error-message" data-i18n="tournament.error_pseudo"></div>
				</div>
				<div title="player7" class="player_title">
					<div data-i18n="tournament.player 7"></div>
					<input title="player7" v-model='player7' :class="{ error: isDuplicate7 }" maxlength="13"></input>
					<div v-show="isDuplicate7" class="error-message" data-i18n="tournament.error_pseudo"></div>
				</div>
				<div title="player8" class="player_title">
					<div data-i18n="tournament.player 8"></div>
					<input title="player8" v-model='player8' :class="{ error: isDuplicate8 }" maxlength="13"></input>
					<div v-show="isDuplicate8" class="error-message" data-i18n="tournament.error_pseudo"></div>
				</div>
			</div>
			<button @click="handleSubmit" type="button" title="Submit-button" class=" t_Submit-button">
				<div data-i18n="Signup.submit"></div>
			</button>
		</form>
		<quart_final v-if="showQuartFinal" :order_for_matches="order_for_matches" :setLanguage="props.setLanguage"> </quart_final>
</template>

<style>
.eight_player_frame{
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
	font-size: 2em;
}

.error-message {
  color: #ffffff;
  font-size: 0.8em;
  margin-top: 0.10rem;
  text-shadow: 
	0 0 10px #dc3545,
	0 0 10px #dc3545,
	0 0 20px #dc3545;
  font-weight: 500;
  text-shadow: none;
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}


.e_add_players_login{
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	grid-template-rows: 1fr 1fr;
	margin-bottom: 3rem;
	gap: 1rem;
	margin-top: 1rem
}

.player1{
	font-size: 1.8rem;
	 color: 18c3cf;
    text-shadow: 
    0 0 10px #18c3cf,
    0 0 10px #18c3cf,
    0 0 20px #18c3cf;
}
</style>