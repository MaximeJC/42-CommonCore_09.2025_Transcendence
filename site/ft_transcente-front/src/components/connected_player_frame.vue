<script setup lang="ts">

</script>

<template>
	<div	tittle="connected_player_frame" class="frame">
		<div>
		<img src="../../images/default_avatar.png" alt="Avatar" class="avatar">
		</div>
		<div tittle="login" class="login">
			<label>Login</label>
		</div>
		<div tittle="nbr-game" class="stat">
			<label>20</label>
		</div>
		<div tittle="nbr-victory" class="stat">
			<label>15</label>
		</div>
		<div tittle="ratio" class="stat">
			<label>19.09</label>
		</div>
		<div tittle="Rank" class="stat">
			<label>1</label>
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
		align-items: flex-start;
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
</style>