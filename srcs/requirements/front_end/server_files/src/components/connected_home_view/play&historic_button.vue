<script setup lang="ts">
import { EmitFlags } from 'typescript';

const props = defineProps<{
			setLanguage: (lang: string) => void;
	}>();
	const emit = defineEmits(['show-historic', 'show_play']);

</script>

<template>
	<div title="button container" class="button-container">
		<button @click="emit('show_play')" title="play-button" class="play-button">
			<div data-i18n="home_player_button.play"></div>
		</button>
		<button @click="emit('show-historic')" title="historic-button" class="historic-button">
			<div data-i18n="home_player_button.historic"></div>
		</button>
	</div>
</template>

<style>
	.button-container{
		display: grid;
		grid-template-rows: 1fr 0.3fr;
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
		background-color: rgba(251, 255, 34, 0.5);
		font-size: 2rem;
		color: white;
		border: 2px solid #fbff22;
		text-shadow: 
		0 0 10px #fbff22,
		0 0 30px #fbff22;
		box-shadow: 
		0 0 5px #fbff22,
		0 0 10px #fbff22,
		0 0 20px #fbff22;
		padding: 0.5rem 2rem;
		border-radius: 20px;
		cursor: pointer;
		transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
	}

	.historic-button{
		width: fit-content;
		height: auto;
		justify-self: center;
		align-self: center;
		font-family: netron;
		background-color: rgba(156, 50, 133, 0.5);
		font-size: rem;
		color: white;
		border: 2px solid #e251ca;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 30px #dd0aba;
	
		box-shadow: 
		0 0 5px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba;
		padding: 1rem 1rem;
		border-radius: 20px;
		cursor: pointer;
		transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
	}

	.play-button > div {
		margin-top: 0.3rem;
	}
	.play-button:hover{
		background-color: rgba(156, 50, 133, 0.5);

		border: 2px solid #dd0aba;
		box-shadow:
		0 0 5px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba;

		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba;
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