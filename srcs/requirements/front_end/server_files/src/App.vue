<script setup lang="ts">
import { onMounted, nextTick, ref, watch } from 'vue';
import HomeView from './views/HomeView.vue';
import { setLanguage, updateText } from './service/translators';
import pop_up_invite from '@/components/pop_up/pop_up_invite.vue';
import pop_up_cancel from '@/components/pop_up/pop_up_play.vue';
import { playerInvited } from '@/gameInviteService';
import { USER_MANAGEMENT_URL } from '@/config/config.js';

import { user } from '../src/user';
import { socket, connectSocket, disconnectSocket } from '@/service/socketService'; // Import le socket
const { currentUser } = user();
const currentInvite = ref('');

const inviteurLogin = ref<string | null>(null);
const inviteLogin = playerInvited;

const props = defineProps<{
	setinviteur: (inviteur: string) => void;
	setinvite: (invite: string) => void;
}>();

onMounted(async () => {
	await nextTick()
	updateText()	 // <-- c’est ça qu’il faut appeler au premier rendu
})

function handleServerMessage(event: MessageEvent) {
	try {
		const data = JSON.parse(event.data);

		if (data.event === 'friend_invite') {
			console.log("invite jeu recue via WebSocket !", data.payload);
			inviteurLogin.value = data.payload.loginInviteur;
			console.log("invite jeu de :", inviteurLogin.value);
		}
		if (data.event === 'friend_invite_cancel') {
			console.log("invite jeu annule via WebSocket !", data.payload);
			inviteurLogin.value = "";
			console.log("invite jeu annule :", inviteurLogin.value);
		}
		if (data.event === 'friend_invite_decline') {
			console.log("invite jeu refuse via WebSocket !", data.payload);
			inviteLogin.value = "";
			console.log("invite jeu refuse :", inviteurLogin.value);
		}
		if (data.event === 'friend_invite_accepted') {
			console.log("invite jeu accepte via WebSocket !", data.payload);
			inviteLogin.value = "";
			console.log("invite jeu accepte :", inviteurLogin.value);

			//rediriger vers playable_page
			//user = currentUser.value?.login
			//opponent = inviteLogin.value
		}
	} catch (error) {
		console.error('Erreur de parsing du message WebSocket:', error);
	}
}

async function onInvitationAccepted() {
	console.log(`Invitation de ${inviteurLogin.value} acceptee !`);

	const result = await fetch(`${USER_MANAGEMENT_URL}/friends/invite_accept`, {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json',
		},
			body: JSON.stringify({
			login1: currentUser.value?.login,
			login2: inviteurLogin.value
		})
	});
	if (!result.ok)
		throw new Error(`${result.status}`);
	console.log("Ami invite accepte avec succes.", inviteLogin.value);

	//rediriger vers playable_page
	//user = currentUser.value?.login
	//opponent = inviteurLogin.value

	inviteurLogin.value = null;
}

async function onInvitationRefused() {
	console.log(`Invitation de ${inviteurLogin.value} refusee.`);

	const result = await fetch(`${USER_MANAGEMENT_URL}/friends/invite_decline`, {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json',
		},
			body: JSON.stringify({
			login1: currentUser.value?.login,
			login2: inviteurLogin.value
		})
	});
	if (!result.ok)
		throw new Error(`${result.status}`);
	console.log("Ami invite refuse avec succes.", inviteLogin.value);

	inviteurLogin.value = null;
}

async function onInvitationCancel() {
	console.log(`Invitation pour ${inviteLogin.value} annule.`);

	const result = await fetch(`${USER_MANAGEMENT_URL}/friends/invite_cancel`, {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json',
		},
			body: JSON.stringify({
			login1: currentUser.value?.login,
			login2: inviteLogin.value
		})
	});
	if (!result.ok)
		throw new Error(`${result.status}`);
	console.log("Ami invite annule avec succes.", inviteLogin.value);
	inviteLogin.value = null;
}

function handleInvite(friendLogin: string) {
    console.log(`Event 'invite' recu pour le joueur : ${friendLogin}`);
    inviteLogin.value = friendLogin;
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
	<pop_up_invite v-if="inviteurLogin"
	:inviteur="inviteurLogin"
	@accept="onInvitationAccepted" 
	@refuse="onInvitationRefused"></pop_up_invite>

	<pop_up_cancel v-if="inviteLogin"
	:invite="inviteLogin"
	@cancel="onInvitationCancel"></pop_up_cancel>

	<div class="inviteLogin">{{ inviteLogin}}</div>
	<div class="home-container"> 
		<HomeView :setLanguage="setLanguage" 
		 @invite="handleInvite"></HomeView>
	</div>

</template>

<style scoped>
	.home-container{
		display: flex;
		flex-direction: column;
		position: relative;
	}
</style>
