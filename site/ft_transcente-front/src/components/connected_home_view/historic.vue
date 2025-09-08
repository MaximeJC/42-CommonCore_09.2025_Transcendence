<script setup lang="ts">
	import { ref, onMounted, defineExpose } from 'vue';
	const props = defineProps<{
			setLanguage: (lang: string) => void;
	}>();
</script>

<template>
	<div class="historic-container">
		<div class="tittle" data-i18n="historic.historic"></div>
	</div>
</template>

<style>
	.historic-container{
		display: grid;
		grid-template-rows: min-content;
		width:50.5rem;
		height: 26rem;
		background-color: rgba(156, 50, 133, 0.5);
		border: 2px solid #e251ca;
		box-shadow: 
		0 0 5px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba;
		padding: 1rem 2rem;
		border-radius: 20px;
	}

	.tittle{
		display: block;
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
		align-self: center;
		margin-bottom: 0.5rem;
		text-align: center;

	}
</style>