<script setup lang="ts">
import selec_play from './selection-type-play.vue'
import play from './playable_page.vue'
import tournament from './tournament/tournament_page.vue'
import { ref, onMounted, watch } from 'vue';

const props = defineProps<{
		setLanguage: (lang: string) => void;
		show_play: boolean;
		activePlay: string;
		opponentLogin: string | null;
	}>();

const emit = defineEmits(['show_play', 'isPlayActive', 'clear-opponent']);
const activePlay = ref('');
const isPlayActive = ref(false);
const isonline = ref(false)

const handletypeplay = (isActive: boolean, type: string) => {
	isonline.value = isActive;
	activePlay.value = type;
	isPlayActive.value = !isPlayActive.value
	emit('isPlayActive');
	console.log('isPlayActive:', isPlayActive.value, 'activePlay:', activePlay.value);
};

const handleClearOpponent = () => {
	console.log('[play_page.vue] Nettoyage de l\'opponent demandé');
	emit('clear-opponent');
};

watch(() => props.activePlay, (newVal) => {
	if (newVal && newVal !== '') {
		console.log(`[play_page.vue] Recu le mode de jeu '${newVal}', lancement direct du jeu.`);
		
		// Si on lance un mode différent de 1V1_ONLINE, nettoyer l'opponent
		if (newVal !== '1V1_ONLINE') {
			handleClearOpponent();
		}
		
		isPlayActive.value = true;
		activePlay.value = newVal;
	}
}, { immediate: true });

</script>

<template>
	<div v-if="!isPlayActive">
		<selec_play
			@show_play="emit('show_play')"
			@typeplay="handletypeplay"
			:show_play="props.show_play"
			:set-language="props.setLanguage"
		></selec_play>
	</div>
	<div v-if="isPlayActive && activePlay !== 'tournament'">
		<play
		:activePlay="activePlay"
		:opponentLogin="props.opponentLogin"
		:set-language="props.setLanguage"
		@clear-opponent="handleClearOpponent"
		></play>
	</div>
	<div v-if="isPlayActive && activePlay === 'tournament'">
		<tournament :setLanguage="props.setLanguage"></tournament>
	</div>
</template>

<style>

</style>