<script setup lang="ts">
import { ref, onMounted } from 'vue';
const props = defineProps<{
		setLanguage: (lang: string) => void;
}>();

const rootElement = ref<HTMLElement | null>(null);

defineExpose({
	rootElement
});

const emit = defineEmits(['showOtherPlayer']);

const search_friends = ref("") // ami a ajouter

let friend: string;

interface Friend {
	name: string;
	avatar_src: string;
	isconnected: boolean;
}

const friends = ref<Friend[]>([]);

async function fetchFriends() {
	try {
		//todo remplacer ce currentUserLogin code en dur par le login de l'utilisateur connecte:
		// const currentUserLogin = "Louise";
		const current = await fetch(`http://${window.location.hostname}:3000/me`, {
			method: 'GET',
			credentials: 'include'
		});
		if (!current.ok)
			throw new Error(`Erreur http: ${current.status}`);
		const currentUser = await current.json();
		const currentUserLogin = currentUser.user.login;

		console.log(currentUserLogin);

		const result = await fetch(`http://${window.location.hostname}:3000/friends/me?login_current=${encodeURIComponent(currentUserLogin)}`, {
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
		//todo recuperer les logins dynamiquement
		// const ajouteur = 'Louise';
		const current = await fetch(`http://${window.location.hostname}:3000/me`);
		if (!current.ok)
			throw new Error(`Erreur http: ${current.status}`);
		const currentUser = await current.json();
		const ajouteur = currentUser.user.login;

		const ajoute = search_friends.value;

		console.log("Tentative d'ajout d'ami:", ajouteur, ajoute);

		const result = await fetch(`http://${window.location.hostname}:3000/friends`, {
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
		fetchFriends();
	} catch (err) {
		console.error("Erreur de creation d'amitie:", err);
	}
}

async function deleteFriend(unfriendLogin: string) {
	try {
		//todo recuperer les logins dynamiquement
		// const supprimeur = 'Louise';
		const current = await fetch(`http://${window.location.hostname}:3000/me`);
		if (!current.ok)
			throw new Error(`Erreur http: ${current.status}`);
		const currentUser = await current.json();
		const supprimeur = currentUser.user.login;
		const result = await fetch(`http://${window.location.hostname}:3000/friends/delete`, {
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
		fetchFriends();
	} catch (err) {
		console.error("Erreur de suppression d'amitie:", err);
	}
}

onMounted(()=>{ fetchFriends(); });

</script>

// const friends: Friend[] = [
// 	{ name: "Micka", avatar_src: "../../images/default_avatar.png", isconnected: true},
// 	{ name: "Louise", avatar_src: "../../images/default_avatar.png", isconnected: false},
// 	{ name: "Maxime", avatar_src: "../../images/default_avatar.png", isconnected: false},
// 	{ name: "Axel", avatar_src: "../../images/default_avatar.png", isconnected: true},
// 	{ name: "Nico", avatar_src: "../../images/default_avatar.png", isconnected: false},
// 	{ name: "Thomas", avatar_src: "../../images/default_avatar.png", isconnected: true},
// 	{ name: "Anas", avatar_src: "../../images/default_avatar.png", isconnected: true},
// 	{ name: "Arthur", avatar_src: "../../images/default_avatar.png", isconnected: true},
// 	{ name: "Dorina", avatar_src: "../../images/default_avatar.png", isconnected: false},
// 	{ name: "Wictor", avatar_src: "../../images/default_avatar.png", isconnected: true},
// ]

<template>
	<div ref="rootElement" title="friend-list-container" class="friend-list-container">
		<div class="title-leaderbord" data-i18n="friendlist.friendlist"></div>
		<div class="add-friends" data-i18n="friendlist.addfriends"></div>
		<form class="input-add-friends" @submit.prevent>
			<input id="search_friends" v-model="search_friends" required placeholder="search"></input>
			<button @click="addFriend" type="button"></button>
		</form>
		<div  class="friendlist-container">
			<ul class="friendlist" v-for="friend in friends" :key="friend.name">
				<li class="friend">
					<button @click="emit('showOtherPlayer')" class="avatar_button">
						<img class="friend-avatar" :src="friend.avatar_src" alt="avatar">
					</button>
					<button @click="emit('showOtherPlayer')" title="friend-button" class="friend-button">{{ friend.name }}</button>
					<button title="inv-play-button" class="inv-play-button" :class="{'can-hover' : friend.isconnected}">
						<img v-show="friend.isconnected" src="../../../images/green-play-button.png" alt="play button">
						<img v-show="!friend.isconnected" src="../../../images/red-play-button.png" alt="play button">
						<img src="../../../images/yelow-play-button.png" alt="play button">
					</button>
					<button title="delete-button" class="delete-button" @click="deleteFriend(friend.name)">
						<img src="../../../images/trash_can.png" alt="trash can">
						<img src="../../../images/trash_can_yellow.png" alt="trash can">
					</button>
				</li>
			</ul>
		</div>
	</div>
</template>

<style>
	.friend-list-container{

		display: grid;
		grid-template-rows: min-content;
		height: 26rem;
		grid-template-columns: 1fr;
		align-content: flex-start;
		width: auto;
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

	.add-friends{
		color: white;
		font-size: 1rem;
		text-shadow: 
		0 0 10px #18c3cf,
		0 0 20px #18c3cf;
	}

	.input-add-friends{
		display: grid;
		grid-template-columns: 1fr 0.1fr;
		gap: 1rem;
		align-items: center;
		border-bottom: 2px solid #ddd;
	}

	.input-add-friends > input{
		width: auto;
		font-size: 1.2rem;
		margin-bottom: 0.5rem;
		border-radius: 20px;
		border: none;
	}

	.input-add-friends > button{
		display: block;
		background-image:  url("../../images/add_button.png");
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		height: 2rem;
		width: 2rem;
		border-radius: 50%;
		border: 1px solid #fbff22;
		box-shadow: 
		0 0 10px #fbff22,
		0 0 20px #fbff22;
		transition:background-image 0.3s ease-in-out background-color 0.3s ease-in-out, background-color 0.3s ease-in-out, border 0.3s ease-in-out, box-shadow 0.3 ease-in-out;
		cursor: pointer;
		margin-bottom: 0.5rem;
	}

	.input-add-friends > button:hover{
		background-image:  url("../../../images/add_button_alt.png");

		border: 1px solid #dd0aba;
		box-shadow: 
			0 0 10px #dd0aba,
			0 0 10px #dd0aba,
			0 0 20px #dd0aba,
			0 0 40px #dd0aba,
			0 0 120px #dd0aba;
	}

	.friendlist-container{
		margin-top: 1rem;
		overflow: auto;
		height: 100%;
		scrollbar-color: #dd0aba transparent;
	}

	.friend-list-container::-webkit-scrollbar-track{
		background-color: transparent;
	}

	.friend{
		display: grid;
		grid-template-rows: min-content;
		grid-template-columns:  0.1fr 1fr 0.1fr 0.1fr;
		border: 2px solid #dd0aba;
		padding: 0.3rem 0.6rem;
		margin-bottom: 1rem;
		margin-right: 1rem;
		align-content: center;
		border-radius: 12px;
	
	}

	.friendlist{
		display: grid;
		grid-template-rows: min-content;
		grid-template-columns: 1fr;
		align-content: flex-start;
		justify-content: space-between;
		padding: 0;
		margin:0%;
		list-style-type: none;
	}

	

	.friend-button{
		border: none;
		color: white;
		font-size: 1.5rem;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #dd0aba;
		text-align: left;
		background: transparent;
		cursor: pointer;
		transition: background-color 0.3s ease-in-out, border 0.3s ease-in-out, box-shadow 0.3 ease-in-out;

	}

	.friend-button:hover{
		text-shadow: 
		0 0 10px #fbff22,
		0 0 20px #fbff22;
	
	}

	.avatar_button {
		display: flex;
		justify-content: center;
		align-items: center;
		border: none;
		border-radius: 50%;
		width: 2rem;
		height: 2rem;
		box-shadow: 
		0 0 10px #dd0aba,
		0 0 20px #dd0aba;
		cursor: pointer;
	}

	.avatar_button:hover {
		box-shadow: 
		0 0 10px #fbff22,
		0 0 20px #fbff22;
	}

	.friend-avatar {
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
	}

	.inv-play-button{
		display: flex;
		justify-content: center;
		align-items: center;
		border: none;
		background: none;
		border-radius: 50%;
		width: 1.8rem;
		height: 1.8rem;
		cursor: default;
		margin-right: 1rem;

	}

	.inv-play-button.can-hover{
		cursor: pointer;
	}

	.inv-play-button.can-hover:hover{
		box-shadow: 
		0 0 10px #fbff22,
		0 0 20px #fbff22,
		0 0 40px #fbff22,
		0 0 80px #fbff22;
	}

	.inv-play-button > img{
		width: 1.8rem;
		height: 1.8rem;
		border-radius: 50%;
	}

	.inv-play-button > img:nth-child(3){
		display: none;
	}
	.can-hover:hover > img:nth-child(1){
		display: none;
	}

	.can-hover:hover > img:nth-child(1){
		display: none;
	}

	.can-hover:hover > img:nth-child(3){
		display: block;
		background-color: rgba(251, 255, 34, 0.5);
	}

	.delete-button{
		display:block;
		background-color: transparent;
		border: none;
		cursor: pointer;
	}
	.delete-button :hover{
		box-shadow: 
		0 0 10px #fbff22,
		0 0 20px #fbff22,
		0 0 40px #fbff22,
		0 0 80px #fbff22;
	
	}

	.delete-button > img{
		width: 1.2rem;
		height: 1.6rem;
	}

	.delete-button > img:nth-child(2){
		display: none;
	}
	.delete-button:hover > img:nth-child(1){
		display: none;
	}

	.delete-button:hover > img:nth-child(2){
		display: block;
		background-color: rgba(251, 255, 34, 0.5);

	}
	
</style>