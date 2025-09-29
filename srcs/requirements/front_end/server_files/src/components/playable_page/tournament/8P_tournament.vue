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

const list_of_players = ref(["","","","","","","",""])
const order_for_matches = ref(["","","","","","","",""])
function handleSubmit(e: Event) {
	e.preventDefault();
	const inputs = document.querySelectorAll<HTMLInputElement>('.e_add_players_login input');
	list_of_players.value = Array.from(inputs).map(input => input.value.trim());
	order_for_matches.value = shuffleArray(list_of_players.value);
	showQuartFinal.value = true;
}

const playBox = ref<HTMLElement | null>(null);

</script>

<template>
	<form v-show="!showQuartFinal" class="eight_player_frame">
			<div class="title">Choissisez vos pseudo</div>
			<div title="add_players_login" class="e_add_players_login">
				
				<div title="player1" class="player_title">
					<div data-i18n="tournament.player 1"></div>
					<input title="player1"></input>
				</div>
				<div title="player2" class="player_title">
					<div data-i18n="tournament.player 2"></div>
					<input title="player2"></input>
				</div>
				<div title="player3" class="player_title">
					<div data-i18n="tournament.player 3"></div>
					<input title="player3"></input>
				</div>
				<div title="player4" class="player_title">
					<div data-i18n="tournament.player 4"></div>
					<input title="player4"></input>
				</div>
				<div title="player5" class="player_title">
					<div data-i18n="tournament.player 5"></div>
					<input title="player5"></input>
				</div>
				<div title="player6" class="player_title">
					<div data-i18n="tournament.player 6"></div>
					<input title="player6"></input>
				</div>
				<div title="player7" class="player_title">
					<div data-i18n="tournament.player 7"></div>
					<input title="player7"></input>
				</div>
				<div title="player8" class="player_title">
					<div data-i18n="tournament.player 8"></div>
					<input title="player8"></input>
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



.e_add_players_login{
	display: grid;
	grid-template-columns: 1fr 1fr 1fr 1fr;
	grid-template-rows: 1fr 1fr;
	margin-bottom: 3rem;
	gap: 1rem;
	margin-top: 1rem
}

.player_title {
    display: grid;
    gap: 0.5rem;
    grid-template-rows: 1fr 1fr;
    grid-template-columns: 1fr;
	margin-left: 1rem;
    font-family: netron;
    font-weight: bold;
    color: white;
    text-shadow: 
    0 0 10px #dd0aba,
    0 0 10px #dd0aba,
    0 0 20px #dd0aba;
    font-size: 1.5rem;
    margin-top: 1rem;
    
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
</style>