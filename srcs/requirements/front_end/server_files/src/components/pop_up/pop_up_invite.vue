<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick, computed } from 'vue';
import { setLanguage, updateText } from '../../service/translators';
// import { USER_MANAGEMENT_URL } from '@/config/config.js';
// import { user } from '../../user';
// import { socket, connectSocket, disconnectSocket } from '@/service/socketService'; // Import le socket
// const { currentUser } = user();

const props = defineProps<{
  inviteur: string;
}>();

const emit = defineEmits<{
  (e: 'accept'): void;
  (e: 'refuse'): void;
}>();

onMounted(async () => {
	await nextTick()
	updateText() 
})

function handleAccept() {
	emit('accept');
}

function handleRefuse() {
	emit('refuse');
}

</script>

<template>
	<div title="pop_up_container" class="pop_up_container">
		<div title="Pop_up_message" class="Pop_up_message">
			<div>{{ inviteur }}</div>
			<div> vous invite ajouer</div> <!-- TODO : ajouter a langue-->
		</div>
		<div title="pop_up_button_container" class="pop_up_button_container">
			<button @click=handleRefuse title="pop_up_no" class="pop_up_no" data-i18n="invit.refuse"></button> <!-- fermer popup-->
			<button @click=handleAccept title="pop_up_yes" class="pop_up_yes" data-i18n="invit.accept"></button> <!-- fermer popup et rejoindre game-->
		</div>
	</div>
</template>

<style>

.Pop_up_message > :nth-child(2){
	font-size: 1.5rem;
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


</style>