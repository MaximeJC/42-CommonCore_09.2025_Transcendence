<script setup lang="ts">
	import { onMounted, ref, nextTick, watch, computed } from "vue"
	import type { Ref } from "vue"
	import { user } from '../../user';
	const emit = defineEmits(['gameisfinish']);

	const props = defineProps<{
		setLanguage: (lang: string) => void;
	}>();

	const { currentUser } = user();
	const nbr_players = ref(0);

	const chooseNbrPlayers = (n: number) => {
		nbr_players.value = n;
	}

	interface Players {
		player1: string;
		player2: Ref<string>;
		player3: Ref<string>;
		player4: Ref<string>;
		player5: Ref<string>;
		player6: Ref<string>;
		player7: Ref<string>;
		player8: Ref<string>;
	}

	const list_of_players: Players = {
		player1: "",
		player2: ref(""),
		player3: ref(""),
		player4: ref(""),
		player5: ref(""),
		player6: ref(""),
		player7: ref(""),
		player8: ref("")
	};

	// Replace $SELECTION_PLACEHOLDER$ with this code:

	watch(nbr_players, (val) => {
		if (val === 4 || val === 8) {
			list_of_players.player1 = currentUser.value?.login ?? "";
		}
	});

	

</script>

<template>
		<div v-show="nbr_players === 0" class="select_offline_online_page">
			<button @click="chooseNbrPlayers(4)" class="select_button">
				<div class="play_title" data-i18n="play.4_players"></div>
			</button>
			<button @click="chooseNbrPlayers(8)" class="select_button">
				<div class="play_title" data-i18n="play.8_players"></div>
			</button>
		</div>
		<form v-show="nbr_players == 4" class="four_player_frame">
			<div class="title">Choissisez vos pseudo</div>
			<div title="add_players_login" class="add_players_login">
				
				<div title="player1" class="player_title">
					<div>player 1</div>
					<div class="player1">{{ list_of_players.player1 }}</div>
				</div>
				<div title="player2" class="player_title">
					<div>player 2</div>
					<input title="player2"></input>
				</div>
				<div title="player3" class="player_title">
					<div>player 3</div>
					<input title="player3"></input>
				</div>
				<div title="player4" class="player_title">
					<div>player 4</div>
					<input title="player4"></input>
				</div>
			</div>
			<button title="Submit-button" class=" t_Submit-button">
				<div data-i18n="Signup.submit"></div>
			</button>
		</form>
		
</template>

<style scoped>

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
	font-size: 2em;
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
    grid-template-rows: 1fr 1fr;
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

</style>