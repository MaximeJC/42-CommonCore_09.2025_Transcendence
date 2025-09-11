<script setup lang="ts">
	import { ref, onMounted } from 'vue';
	const props = defineProps<{
			setLanguage: (lang: string) => void;
	}>();

	const rootElement = ref<HTMLElement | null>(null);

	defineExpose({
		rootElement
	});

	const emit = defineEmits(['show-other_player']);

	const search_friends = ref("")

	let friend: string;

	interface Friend {
		name: string;
		avatar_src: string;
		isconnected: boolean;
	}

	const friends: Friend[] = [
		{ name: "Micka", avatar_src: "../../images/default_avatar.png", isconnected: true},
		{ name: "Louise", avatar_src: "../../images/default_avatar.png", isconnected: false},
		{ name: "Maxime", avatar_src: "../../images/default_avatar.png", isconnected: false},
		{ name: "Axel", avatar_src: "../../images/default_avatar.png", isconnected: true},
		{ name: "Nico", avatar_src: "../../images/default_avatar.png", isconnected: false},
		{ name: "Thomas", avatar_src: "../../images/default_avatar.png", isconnected: true},
		{ name: "Anas", avatar_src: "../../images/default_avatar.png", isconnected: true},
		{ name: "Arthur", avatar_src: "../../images/default_avatar.png", isconnected: true},
		{ name: "Dorina", avatar_src: "../../images/default_avatar.png", isconnected: false},
		{ name: "Wictor", avatar_src: "../../images/default_avatar.png", isconnected: true},
	]

</script>

<template>
	<div ref="rootElement" title="friend-list-container" class="friend-list-container">
		<div class="title-leaderbord" data-i18n="friendlist.friendlist"></div>
		<div class="add-friends" data-i18n="friendlist.addfriends"></div>
		<form class="input-add-friends">
			<input id="search_friends" v-model="search_friends" required placeholder="search"></input>
			<button type="submit"></button>
		</form>
		<div  class="friendlist-container">
			<ul class="friendlist" v-for="friend in friends" :key="friend.name">
				<li class="friend">
					<button @click="emit('show-other_player')" class="avatar_button">
						<img class="friend-avatar" :src="friend.avatar_src" alt="avatar">
					</button>
					<button @click="emit('show-other_player')" title="friend-button" class="friend-button">{{ friend.name }}</button>
					<button title="inv-play-button" class="inv-play-button" :class="{'can-hover' : friend.isconnected}">
						<img v-show="friend.isconnected" src="../../../images/green-play-button.png" alt="play button">
						<img v-show="!friend.isconnected" src="../../../images/red-play-button.png" alt="play button">
						<img src="../../../images/yelow-play-button.png" alt="play button">
					</button>
					<button title="delete-button" class="delete-button">
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