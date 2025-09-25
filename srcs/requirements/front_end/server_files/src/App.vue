<script setup lang="ts">
import { onMounted, nextTick, ref, watch } from 'vue';
import HomeView from './views/HomeView.vue';
import { setLanguage, updateText } from './service/translators';
import pop_up from '@/components/pop_up/pop_up_play.vue';

import { user } from '../src/user';
import { socket, connectSocket, disconnectSocket } from '@/service/socketService'; // Import le socket
const { currentUser } = user();

const inviteurLogin = ref<string | null>(null);

const props = defineProps<{
	setinviteur: (inviteur: string) => void;
}>();

onMounted(async () => {
  	await nextTick()
  	updateText()   // <-- c’est ça qu’il faut appeler au premier rendu
})

function handleServerMessage(event: MessageEvent) {
	try {
		const data = JSON.parse(event.data);

		if (data.event === 'friend_invite') {
			console.log("invite jeu recue via WebSocket !", data.payload);
			inviteurLogin.value = data.payload.loginInviteur;
			console.log("invite jeu de :", inviteurLogin.value);
		}
	} catch (error) {
		console.error('Erreur de parsing du message WebSocket:', error);
	}
}

function onInvitationAccepted() {
  console.log(`Invitation de ${inviteurLogin.value} acceptee !`);

  inviteurLogin.value = null;
}

function onInvitationRefused() {
  console.log(`Invitation de ${inviteurLogin.value} refusee.`);

  inviteurLogin.value = null;
}

watch(socket, (newSocket, oldSocket) => {
	if (oldSocket) {
		oldSocket.removeEventListener('message', handleServerMessage);
	}
	if (newSocket) {
		newSocket.addEventListener('message', handleServerMessage);
	}
});

</script>
<template>
	<pop_up v-if="inviteurLogin"
    :inviteur="inviteurLogin"
    @accept="onInvitationAccepted" 
    @refuse="onInvitationRefused"></pop_up>
	<div class="home-container"> 
		<HomeView :setLanguage="setLanguage" ></HomeView>
	</div>

</template>

<style scoped>
	.home-container{
		display: flex;
		flex-direction: column;
		position: relative;
	}
</style>
