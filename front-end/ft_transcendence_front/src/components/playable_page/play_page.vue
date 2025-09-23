<script setup lang="ts">
import selec_play from './selection-type-play.vue'
import play from './playable_page.vue'
import { ref, onMounted, defineProps } from 'vue';

const props = defineProps<{
		setLanguage: (lang: string) => void;
		show_play: boolean;
	}>();

const emit = defineEmits(['show_play', 'isPlayActive']);
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
	<div v-show="isPlayActive">
		<play
		:activePlay="activePlay"
		:set-language="props.setLanguage"
		@gameisfinish="handletypeplay"
		></play>
	</div>
</template>

<style>

</style>