<script setup lang="ts">

</script>

<template>
	<div tittle="connected_player_frame" class="frame">
		<div>
		<img src="../../images/default_avatar.png" alt="Avatar" class="avatar">
		</div>
		<div tittle="login" class="login">
			<div>Login</div>
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
				<div tittle="ratio" class="label_stat">ratio</div>
				<div tittle="ratio_stat" class="stat">19.09</div>
			</div>
			<div class="stat-container">
				<div tittle="rank" class="label_stat" data-i18n="player_stat.rank"></div>
				<div tittle="rank_stat" class="stat">1</div>
			</div>
	</div>
</template>

<style>
@font-face {
	font-family: "netron";
	src: url("../../fonts/netron.regular.otf") format("opentype");
	}

	.frame{
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 80rem;
		background-color: rgba(156, 50, 133, 0.5);
		border: 2px solid #e251ca;
		box-shadow: 
		0 0 5px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba;
		padding: 2rem 3rem;
		border-radius: 20px;
		transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
		margin-top: 3rem
	}

	.avatar{
		width: 10rem;
		height: 10rem;
		border-radius: 50%;
	}

	.login{
		display: flex;
		align-self: center;
		justify-content: center;
		font-family: netron;
		color: white;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #ff69b4,
		0 0 120px #dd0aba;
		font-size: 3rem;
		font-family: netron;
		color: white;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #ff69b4,
		0 0 120px #dd0aba;
		margin-bottom: 1rem;
	}

	.stat-container{
		display: flex;
		flex-direction: column;
		align-items: center;
		/*gap: 3rem;*/
	}

	.label_stat{
		font-family: netron;
		color: white;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #ff69b4,
		0 0 120px #dd0aba;
		font-size: 1.5rem;
		font-family: netron;
		color: white;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #ff69b4,
		0 0 120px #dd0aba;
		margin-bottom: 1rem;
	}

	.stat{
		display: flex;
		align-items: center;
		justify-content: center;
		font-family: netron;
		width: 6rem;
		height: 6rem;;
		border-radius: 50%;
		font-size: 2rem;
		border: 3px solid #ff69b4;
		color: white;

		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #ff69b4,
		0 0 120px #dd0aba;
	}
</style>