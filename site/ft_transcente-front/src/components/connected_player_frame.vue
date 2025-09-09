<script setup lang="ts">
import { ref, onMounted } from 'vue';
	const props = defineProps<{
			setLanguage: (lang: string) => void;
	}>();

	

</script>

<template>
	<div tittle="connected_player_frame" class="connected_player_frame">
		<div class="avatar+login">
			<img src="../../images/default_avatar.png" alt="Avatar" class="avatar">
			<div tittle="login" class="login">
				<div>Login</div>
			</div>
		</div>
		<div class="stat-container">
			<div tittle="nbr-game" class="label_stat" data-i18n="player_stat.nbr_games"></div>
			<div tittle="nbr_game_stat" class="stat">20</div>
		</div>
		<div class="stat-container">
			<div tittle="nbr-victory" class="label_stat" data-i18n="player_stat.nbr_victory"></div>
			<div tittle="nbr-victory_stat" class="stat">10</div>
		</div>
		<div class="stat-container">
			<div tittle="rank" class="label_stat" data-i18n="player_stat.rank"></div>
			<div tittle="rank_stat" class="stat">1</div>
		</div>
		<div tittle="button container" class="button-container">
			<button tittle="play-button" class="play-button">
				<div data-i18n="home_player_button.play"></div>
			</button>
			<button tittle="historic-button" class="historic-button">
				<div data-i18n="home_player_button.historic"></div>
			</button>
		</div>
	</div>
</template>

<style>
	@font-face {
	font-family: "netron";
	src: url("../../fonts/netron.regular.otf") format("opentype");
	}

	.connected_player_frame{
		display: flex;
		justify-content: space-between;
		align-items: center;
		width:min-content;
		background-color: rgba(156, 50, 133, 0.5);
		border: 2px solid #e251ca;
		box-shadow: 
		0 0 5px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba;
		padding: 1rem 2rem;
		border-radius: 20px;
		transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
	}

	.avatar\+login{
		display: flex;
		flex-direction: column;
		margin-right: 1rem;
	}
	
	.avatar{
		width: 6.5rem;
		height: 6.5rem;
		border-radius: 50%;
		border:2px solid #ffffff;
		box-shadow: 
		0 0 10px #fbff22,
		0 0 20px #fbff22;
	}

	.login{
		display: flex;
		align-self: center;
		justify-content: center;
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
		font-size: 1.5rem;
		margin-top: 1rem;
	}

	.stat-container{
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0px 1rem;
	}

	.label_stat{
		font-family: netron;
		color: white;
		font-weight: bold;
		text-shadow: 
		0 0 10px #fbff22,
		0 0 20px #fbff22;
		font-size: 1.5rem;
		font-family: netron;
		color: white;
		margin-bottom: 1rem;
	}

	.stat{
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: netron;
		width: 5rem;
		height: 5rem;;
		border-radius: 50%;
		font-size: 2.3rem;
		font-weight: bold;
		border: 5px solid #fffffd;
		color: white;
		box-shadow: 
		0 0 10px #dd0aba,
		0 0 30px #dd0aba;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba;
	}

	.button-container{
		display: grid;
		grid-template-rows: 1fr 0.5fr;
		grid-template-columns: min-content;
		width: auto;
		height: auto;
		margin-left: 2rem;
		gap: 1rem;
	}

	.play-button{
		width: auto;
		height: auto;
		font-family: netron;
		background-color: rgba(156, 50, 133, 0.5);
		font-size: 3rem;
		color: white;
		border: 2px solid #e251ca;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 30px #dd0aba;
		box-shadow: 
		0 0 5px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba;
		padding: 1rem 2rem;
		border-radius: 20px;
		cursor: pointer;
		transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
	}

	.historic-button{
		width: auto;
		height: auto;
		font-family: netron;
		background-color: rgba(156, 50, 133, 0.5);
		font-size: 1.5rem;
		color: white;
		border: 2px solid #e251ca;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 30px #dd0aba;
	
		box-shadow: 
		0 0 5px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba;
		padding: 1rem 2rem;
		border-radius: 20px;
		cursor: pointer;
		transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
	}

	.play-button > div {
		margin-top: 0.3rem;
	}
	.play-button:hover{
		background-color: rgba(251, 255, 34, 0.5);
		border: 2px solid #fbff22;
		box-shadow:
		0 0 5px #fbff22,
		0 0 10px #fbff22,
		0 0 20px #fbff22;

		text-shadow: 
		0 0 10px #fbff22,
		0 0 10px #fbff22,
		0 0 20px #fbff22;
	}

	.historic-button:hover{
		background-color: rgba(251, 255, 34, 0.5);
		border: 2px solid #fbff22;
		box-shadow:
		0 0 5px #fbff22,
		0 0 10px #fbff22,
		0 0 20px #fbff22;

		text-shadow: 
		0 0 10px #fbff22,
		0 0 10px #fbff22,
		0 0 20px #fbff22;
	}
</style>