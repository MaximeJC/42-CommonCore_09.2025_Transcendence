<script setup lang="ts">
	import { ref, onMounted, defineExpose } from 'vue';
	const props = defineProps<{
			setLanguage: (lang: string) => void;
	}>();

	const rootElement = ref<HTMLElement | null>(null);

	defineExpose({
		rootElement
	});

	const search_friends = ref("")

	let friend: string;

	interface Friend {
		name: string;
		avatar_src: string;
	}

	const friends: Friend[] = [
		{ name: "Micka", avatar_src: "../../images/default_avatar.png"},
		{ name: "Louise", avatar_src: "../../images/default_avatar.png"},
		{ name: "Maxime", avatar_src: "../../images/default_avatar.png"},
		{ name: "Axel", avatar_src: "../../images/default_avatar.png"},
		{ name: "Nico", avatar_src: "../../images/default_avatar.png"},
		{ name: "Thomas", avatar_src: "../../images/default_avatar.png"},
		{ name: "Anas", avatar_src: "../../images/default_avatar.png"},
		{ name: "Arthur", avatar_src: "../../images/default_avatar.png"},
		{ name: "Dorina", avatar_src: "../../images/default_avatar.png"},
		{ name: "Wictor", avatar_src: "../../images/default_avatar.png"},
	]

</script>

<template>
	<div ref="rootElement" tittle="friend-list-container" class="friend-list-container">
		<div class="tittle-leaderbord" data-i18n="friendlist.friendlist"></div>
		<div class="add-friends" data-i18n="friendlist.addfriends"></div>
		<div class="input-add-friends">
			<input id="search_friends" v-model="search_friends" required></input>
			<button></button>
		</div>
		<div  class="friendlist-container">
			<ul class="friendlist" v-for="friend in friends" :key="friend.name">
				<li class="friend">
					<img class="friend-avatar" :src="friend.avatar_src" alt="avatar">
					<button class="friend-button">{{ friend.name }}</button>
					<button class="delete-button">
						<img src="../../images/trash_can.png" alt="trash can">
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
		0 0 10px #fbff22,
		0 0 10px #fbff22,
		0 0 20px #fbff22,
		0 0 40px #fbff22,
		0 0 80px #fbff22;
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

	}

	.input-add-friends > button{
		display: block;
		background-image:  url("../../images/add_button.png");
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		height: 2.5rem;
		width: 2.5rem;
		border-radius: 50%;
		border: 1px solid #fbff22;
		box-shadow: 
		0 0 10px #fbff22,
		0 0 10px #fbff22,
		0 0 20px #fbff22,
		0 0 40px #fbff22,
		0 0 80px #fbff22;
		transition:background-image 0.3s ease-in-out background-color 0.3s ease-in-out, background-color 0.3s ease-in-out, border 0.3s ease-in-out, box-shadow 0.3 ease-in-out;
		cursor: pointer;
		margin-bottom: 0.5rem;
	}

	.input-add-friends > button:hover{
		background-image:  url("../../images/add_button_alt.png");

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
		display: flex;
		border: 2px solid #dd0aba;
		padding: 0.3rem 0.6rem;
		margin-bottom: 1rem;
		margin-right: 1rem;
		align-content: center;
		justify-content: space-between;
	
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
		text-align: center;
		background: transparent;
		cursor: pointer;
		transition: background-color 0.3s ease-in-out, border 0.3s ease-in-out, box-shadow 0.3 ease-in-out;

	}

	.friend-button:hover{
		text-shadow: 
		0 0 10px #fbff22,
		0 0 10px #fbff22,
		0 0 20px #fbff22,
		0 0 40px #fbff22,
		0 0 80px #fbff22,
		0 0 120px #fbff22;
	}

	.friend-avatar{
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
	}

	.delete-button{
		display:block;
		background-color: transparent;
		
		border: none;
	}

	.delete-button > img{
		width: 1.2rem;
		height: 1.6rem;
	}
</style>