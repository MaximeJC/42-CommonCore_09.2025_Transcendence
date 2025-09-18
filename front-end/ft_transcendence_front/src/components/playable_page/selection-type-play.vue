<script setup lang="ts">
	import { ref, watch, onUnmounted, nextTick,computed } from 'vue';

	const props = defineProps<{
		setLanguage: (lang: string) => void;
		show_play: boolean;

	}>();


	const emit = defineEmits(['show_play', 'typeplay']);

	const offline_play = ref(false)
	const online_play = ref(false)

	const toggleoffline = () =>{
		offline_play.value = !offline_play.value
	}

	const toggleonline = () =>{
		online_play.value = !online_play.value
	}

	const offlineBox = ref<HTMLElement | null>(null);
	const onlineBox =  ref<HTMLElement | null>(null);
	const playBox =  ref<HTMLElement | null>(null);
	//const handlePointerDownOutside = (e: PointerEvent) => {
	//	const target = e.target as Node | null;
	//	if (!target) return;

	//	// Fermer offline seulement si ouvert et clic en dehors
	//	if (offline_play.value && offlineBox.value && !offlineBox.value.contains(target)) {
	//		offline_play.value = false;
	//	}

	//	// Fermer online seulement si ouvert et clic en dehors
	//	if (online_play.value && onlineBox.value && !onlineBox.value.contains(target)) {
	//		online_play.value = false;
	//	}

	//	// Gérer l'affichage du "play" uniquement quand rien d'autre n'est ouvert
	//	if (!offline_play.value && !online_play.value && playBox.value && !playBox.value.contains(target)) {
	//		if(props.show_play === true)
	//			emit('show_play');
	//	}
	//};

	//const anyOpen = computed(() => offline_play.value || online_play.value|| playBox.value);
	//watch(anyOpen, (newValue) => {
	//	if (newValue) {
	//		nextTick(() => {
	//			document.addEventListener(
	//				'pointerdown',
	//				handlePointerDownOutside,
	//				{ capture: true}
	//			);
	//		})
	//	}	
	//	else {
	//		document.removeEventListener(
	//			'pointerdown',
	//			handlePointerDownOutside,
	//			{ capture: true}
	//		);
	//	}
	//});

	//onUnmounted(() => {
	//document.removeEventListener('pointerdown', handlePointerDownOutside, { capture: true });
	//})

	const typeplay = (connection: boolean, type: string ) => {
		//console.log(pageName);
		emit('typeplay', connection, type);
	};

</script>



<template>
	<div ref="playBox">
		<div v-show="!offline_play && !online_play" class="select_offline_online_page">
			<button @click="toggleoffline" class="select_button">
				<div class="play_title" data-i18n="play.local_play"></div>
			</button>
			<button @click="toggleonline" class="select_button">
				<div class="play_title" data-i18n="play.online_play"></div>
			</button>
		</div>
	</div>
	<div ref="offlineBox">
		<div v-show="offline_play" class="select_offline_page">
			<button @click="typeplay(false, '1P_VS_AI')" class="select_button">
				<div class="play_title" data-i18n="play.VS_ia"></div>
			</button>
			<button @click="typeplay(false, '2P_LOCAL')" class="select_button">
				<div class="play_title" data-i18n="play.VS_player"></div>
			</button>
			<button @click="typeplay(false, 'tournament')" class="select_button">
				<div class="play_title" data-i18n="play.tournament"></div>
			</button>
		</div>
	</div>
	<div ref="onlineBox">
		<div v-show="online_play" class="select_online_page">
			<button @click="typeplay(true, '1V1_ONLINE')" class="select_button">
				<div class="play_title" data-i18n="play.VS_player"></div>
			</button>
			<button @click="typeplay(true, '4P_ONLINE')" class="select_button">
				<div class="play_title" data-i18n="play.2_VS_2"></div>
			</button>
		</div>
	</div>
</template>

<style>
.select_offline_online_page{
	display: grid;
	position: absolute;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr;
	gap:3rem;
	top: 200%;
	left: 50%;
	transform: translate(-50%, -40%);
}

.select_offline_page{
	display: grid;
	position: absolute;
	grid-template-columns: 1fr 1fr 1fr; 
	grid-template-rows: 1fr;
	gap:3rem;
	top: 200%;
	left: 50%;
	transform: translate(-50%, -40%);
}

.select_online_page{
	display: grid;
	position: absolute;
	grid-template-columns:1fr 1fr; 
	grid-template-rows: 1fr;
	gap:3rem;
	top: 200%;
	left: 50%;
	transform: translate(-50%, -40%);
}

.select_button{
	display: block;
	height: 30rem;
	width: 20rem;
	background-color: rgba(156, 50, 133, 0.5);
	border: 2px solid #e251ca;
	box-shadow: 
	0 0 5px #dd0aba,
	0 0 10px #dd0aba,
	0 0 20px #dd0aba,
	0 0 40px #dd0aba;
	padding: 1rem 2rem;
	border-radius: 20px;
	color: white;
	font-weight: bold;
	text-shadow: 
	0 0 10px #dd0aba,
	0 0 10px #dd0aba,
	0 0 20px #dd0aba,
	0 0 40px #dd0aba,
	0 0 80px #ff69b4,
	0 0 120px #dd0aba;
	font-weight: bold;
	font-size: 3rem;
	cursor: pointer;
	transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;

}

.select_button:hover{
	background-color: rgba(251, 255, 34, 0.5);
	border: 2px solid #fbff22;
	box-shadow: 
	0 0 5px #fbff22,
	0 0 10px #fbff22,
	0 0 20px #fbff22,
	0 0 40px #fbff22,
	0 0 80px #fbff22;

	text-shadow: 
	0 0 10px #fbff22,
	0 0 10px #fbff22;

	}

.play_title{
	display: flex;
	align-self: center;
	justify-content: center;
	font-family: netron;
	line-height: 4rem;
	margin-top: 1rem;
	
	cursor: pointer;
}
</style>