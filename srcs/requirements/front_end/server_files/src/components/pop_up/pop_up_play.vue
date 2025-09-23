<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { setLanguage, updateText } from '../../service/translators';

onMounted(async () => {
	await nextTick()
	updateText() 
})



</script>

<template>
	<div title="pop_up_container" class="pop_up_container">
		<div title="Pop_up_message" class="Pop_up_message">
			<div>login</div>
			<div>vous invite ajouer</div>
		</div>
		<div title="pop_up_button_container" class="pop_up_button_container">
			<button title="pop_up_no" class="pop_up_no" data-i18n="invit.refuse"></button>
			<button title="pop_up_yes" class="pop_up_yes" data-i18n="invit.accept"></button>
		</div>
	</div>
</template>

<style>
.pop_up_container {
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: 1fr 0.5fr;
	background-color: rgba(156, 50, 133, 0.9);
	border: 2px solid #e251ca;
	width: min-content;
	height: 10rem;
	z-index: 9999;
	box-shadow: 
		0 0 5px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba;
	padding: 1rem 4rem;
	border-radius: 20px;
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}

.Pop_up_message{
	display: flex;
	flex-direction: column;
	font-family: netron;
	color: white;
	gap: 1rem;
	text-align: center;
	font-size: 2rem;
	line-break: auto;
	font-weight: bold;
	text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #ff69b4,
		0 0 120px #dd0aba;
}
.Pop_up_message > :nth-child(2){
	font-size: 1.5rem;
}

.pop_up_button_container{
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	gap: 2rem;
}
.pop_up_no{
	font-family: netron;
		align-items: center;
		background-color: rgba(189, 28, 28, 0.7);
		color: white;
		border: 2px solid #e25158;
		text-shadow: 
		0 0 10px #dd0a3f,
		0 0 10px #dd0a3f,
		0 0 20px #dd0a3f;
			box-shadow: 
		0 0 5px #dd0a3f,
		0 0 10px #dd0a3f,
		0 0 20px #dd0a3f,
		0 0 40px #dd0a3f;
		font-size: 1.2rem;
		padding: 1rem 2rem;
		border-radius: 20px;
		cursor: pointer;
		transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
	
}

.pop_up_yes{
	font-family: netron;
		align-items: center;
		background-color: rgba(55, 189, 28, 0.7);
		color: white;
		border: 2px solid #6ee251;
		text-shadow: 
		0 0 10px #57dd0a,
		0 0 10px #57dd0a,
		0 0 20px #57dd0a;
			box-shadow: 
		0 0 5px #57dd0a,
		0 0 10px #57dd0a,
		0 0 20px #57dd0a,
		0 0 40px #57dd0a;
		font-size: 1.2rem;
		padding: 1rem 2rem;
		border-radius: 20px;
		cursor: pointer;
		transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
	
}
</style>