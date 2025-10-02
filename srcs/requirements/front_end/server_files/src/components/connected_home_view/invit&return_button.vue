<script setup lang="ts">

import { USER_MANAGEMENT_URL } from '@/config/config.js';
import { ref, onMounted, watch, nextTick } from 'vue';
import { playerInvited } from '@/gameInviteService';
import { socket, connectSocket, disconnectSocket } from '@/service/socketService'; // Import le socket

//const isconnect = ref(false);
const itsFriend = ref(false);
let currentUserFriend;

const props = defineProps<{
		setLanguage: (lang: string) => void;
		connect: number;
		selectedPlayerLogin: string | null;
}>();

const emit = defineEmits<{
	(e: 'showOtherPlayer'): void
	(e: 'friend-list-changed'): void
}>()

import { user } from '../../user';
const { currentUser } = user(); 

interface Friend {
	name: string;
	avatar_src: string;
	isconnected: boolean;
}

const friends = ref<Friend[]>([]);

async function fetchFriends(currentUserLogin: string) {
	try {
		// console.log("fetchFriends: currentUserLogin =", currentUserLogin);

		const result = await fetch(`${USER_MANAGEMENT_URL}/friends/me?login_current=${encodeURIComponent(currentUserLogin)}`, {
			method: 'GET',
			credentials: 'include',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		if (!result.ok)
			throw new Error(`Erreur http: ${result.status}`);
		const friendList = await result.json();
		friends.value = friendList;
	} catch (err) {
		console.error("Erreur de recuperation des amis:", err);
	}
}

async function addFriend() {
	try {
		// const current = await fetch(`${USER_MANAGEMENT_URL}/me`, {
		// 	method: 'GET',
		// 	credentials: 'include'
		// });
		// if (!current.ok)
		// 	throw new Error(`Erreur http: ${current.status}`);
		// const currentUser = await current.json();
		const ajouteur = currentUser.value?.login ?? "";

		const ajoute = props.selectedPlayerLogin ?? "";

		console.log("addFriend: ajouteur =", ajouteur, ", ajoute =", ajoute);

		if (ajouteur === ajoute)
			throw new Error(`Erreur: on ne peut pas etre ami avec soi-meme`);

		const result = await fetch(`${USER_MANAGEMENT_URL}/friends`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				login1: ajouteur,
				login2: ajoute
			})
		});
		if (!result.ok)
			throw new Error(`${result.status}`);
		console.log("Ami ajoute avec succes.");
		itsFriend.value = true;
		emit('friend-list-changed');
		// fetchFriends(ajouteur);
	} catch (err) {
		console.error("Erreur de creation d'amitie:", err);
	}
	
}

async function inviteFriend (isconnected: number){
	try {
		const inviteur = currentUser.value?.login ?? "";
		const friend = props.selectedPlayerLogin ?? "";
		if (isconnected === 1){
			console.log("inviteFriend: inviteur =", inviteur, ", inviter =", friend);

			const result = await fetch(`${USER_MANAGEMENT_URL}/friends/invite`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json',
				},
					body: JSON.stringify({
						login1: inviteur,
						login2: friend
				})
			});
			if (!result.ok)
				throw new Error(`${result.status}`);
			console.log("Ami invite avec succes.", friend);
			playerInvited.value = friend;
		}

	} catch (err) {
		console.error("Erreur d'invitation':", err);
	}
}

async function checkFriend() {
	try {
		const checkeur = currentUser.value?.login ?? "";
		const friendLogin = props.selectedPlayerLogin ?? "";
		if (checkeur && friendLogin)
		{
			console.log("checkFriend: checkeur =", checkeur, ", checked =", friendLogin);

			const result = await fetch(`${USER_MANAGEMENT_URL}/friends/check`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					login1: checkeur,
					login2: friendLogin
				})
			});
			// console.log("resultat de POST /friends/check =", result);
			if (result.ok) {
				const data = await result.json();
				if (data.isFriend)
					itsFriend.value = true;
				else {
					itsFriend.value = false;
					console.log(friendLogin, ", n'est pas dans la liste d'amis");	
				}
			}
			console.log("Ami checked avec succes.");

		}
	} catch (err) {
		//console.error("Erreur de check d'amitie:", err);
		itsFriend.value = false;
	}
}

async function deleteFriend() {
	try{
		const supprimeur = currentUser.value?.login ?? "";
		const unfriendLogin = props.selectedPlayerLogin ?? ""

		console.log("deleteFriend: supprimer =", supprimeur, ", supprime =", unfriendLogin);

		const result = await fetch(`${USER_MANAGEMENT_URL}/friends/delete`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				login1: supprimeur,
				login2: unfriendLogin
			})
		});
		if (!result.ok)
			throw new Error(`${result.status}`);
		console.log("Ami supprime avec succes.");
		itsFriend.value = false;
		 emit('friend-list-changed');
		// fetchFriends(supprimeur);
	} catch (err) {
		console.error("Erreur de suppression d'amitie:", err);
	}
}

function handleServerMessage(event: MessageEvent) {
	try {
		const data = JSON.parse(event.data);
		if (data.event === 'friend_check') {
			console.log("Check d'amis recue via WebSocket !", data.payload);
			if (currentUser.value?.login) {
				itsFriend.value = true;
			}
		}
		if (data.event === 'friend_update') {
			console.log("Maj liste d'amis recue via WebSocket !", data.payload);
			if (currentUser.value?.login) {
				 checkFriend();
			}
		}
	} catch (error) {
		console.error('Erreur de parsing du message WebSocket:', error);
	}
}

watch(socket, (newSocket, oldSocket) => {
	if (oldSocket) {
		oldSocket.removeEventListener('message', handleServerMessage);
	}
	if (newSocket) {
		newSocket.addEventListener('message', handleServerMessage);
	}
});

watch(() => props.selectedPlayerLogin ?? "", (newLoginFriend) => {
	if (newLoginFriend !== "") { 
		checkFriend();
	} 
}, { immediate: true });

</script>

<template>
	<div title="button container" class="button-container">
		<button v-show="props.connect === 1" @click="inviteFriend(props.connect)"  title="invit-button" class="invit-button">
			<div data-i18n="home_player_button.invit"></div>
		</button>
		<button v-show="props.connect === 0" title="invit-button" class="d-invit-button">
			<div data-i18n="home_player_button.invit"></div>
		</button>
		<div class="i-button-container">
			<button v-if="!itsFriend" @click="addFriend" class="i-add-friends"></button>
			<button v-if="itsFriend" @click="deleteFriend" class="delete-friends"></button>
			<button @click="emit('showOtherPlayer')" tittle="return-button" class="return-button">
				<div data-i18n="home_player_button.return"></div>
			</button>
		</div>
	</div>
</template>

<style>


	.invit-button{
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

	.i-button-container{
		display:flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		padding: 0 1rem;

	}

	.i-add-friends{
		display: block;
		background-image:  url("/images/add_button.png");
		background-size: 1.5rem;
		background-position: center;
		background-repeat: no-repeat;
		height: 2.5rem;
		width: 2.5rem;
		border-radius: 50%;
		border: 1px solid #fbff22;
		box-shadow: 
		0 0 10px #fbff22,
		0 0 20px #fbff22;
		transition:background-image 0.3s ease-in-out background-color 0.3s ease-in-out, background-color 0.3s ease-in-out, border 0.3s ease-in-out, box-shadow 0.3 ease-in-out;
		cursor: pointer;
		margin-bottom: 0.5rem;
		margin-right: 1rem;
	}

	.delete-friends{
		display: block;
		background-image:  url("/images/trash_can.png");
		background-size: 1.5rem;
		background-position: center;
		background-repeat: no-repeat;
		background-color: transparent;
		height: 2.5rem;
		width: 2.5rem;
		border-radius: 50%;
		border: 1px solid #fbff22;
		box-shadow: 
		0 0 10px #fbff22,
		0 0 20px #fbff22;
		/* transition:background-image 0.3s ease-in-out background-color 0.3s ease-in-out, background-color 0.3s ease-in-out, border 0.3s ease-in-out, box-shadow 0.3 ease-in-out; */
		cursor: pointer;
		margin-bottom: 0.5rem;
		margin-right: 1rem;
	}
	
	.i-add-friends:hover{
		background-image:  url("/images/add_button_alt.png");

		border: 1px solid #dd0aba;
		box-shadow: 
			0 0 10px #dd0aba,
			0 0 10px #dd0aba,
			0 0 20px #dd0aba,
			0 0 40px #dd0aba,
			0 0 120px #dd0aba;
	}

	.delete-friends:hover{
		background-image:  url("/images/trash_can_yellow.png");
  		background-color: transparent;
		border: 1px solid #dd0aba;
		box-shadow: 
			0 0 10px #dd0aba,
			0 0 10px #dd0aba,
			0 0 20px #dd0aba,
			0 0 40px #dd0aba,
			0 0 120px #dd0aba;
	}



	.invit-button > div {
		margin-top: 0.3rem;
	}
	.invit-button:hover{
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
	
	.d-invit-button{
		width: auto;
		height: auto;
		font-family: netron;
		background-color: rgba(90, 90, 90, 0.5);
		font-size: 2rem;
		color: rgb(160, 154, 154);
		border: 2px solid #aaaaaa;
		text-shadow: 
		0 0 10px #8f8f8f,
		0 0 30px #8f8f8f;
		box-shadow: 
		0 0 5px #8f8f8f,
		0 0 10px #8f8f8f;
		padding: 0.5rem 2rem;
		border-radius: 20px;
		cursor: default;
		transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
	}

	.d-invit-button > div {
		margin-top: 0.3rem;
	}

	.return-button:hover{
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