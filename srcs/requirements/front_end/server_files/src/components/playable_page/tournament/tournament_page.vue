<script setup lang="ts">
	import { onMounted, onUnmounted, ref, nextTick, watch, computed } from "vue"
	import type { Ref } from "vue"
	import four_player from './4P_tournament.vue'
	import eigth_player from './8P_tournament.vue'
	import { user } from '../../../user';
	import { setLanguage, updateText } from '../../../service/translators';

	// const emit = defineEmits(['gameisfinish']);

	onMounted(async () => {
		await nextTick()
		updateText()
	})

	const props = defineProps<{
		setLanguage: (lang: string) => void;
	}>();

	const nbr_players = ref(0);

	const chooseNbrPlayers = (n: number) => {
		nbr_players.value = n;
	}

	// Replace $SELECTION_PLACEHOLDER$ with this code:
	onMounted(() => {
		chooseNbrPlayers(0)
	});
	
	const playBox = ref<HTMLElement | null>(null);

	const handlePointerDownOutside = (e: PointerEvent) => {
		const target = e.target as Node | null;
		if (!target) return;

		if ((target as Element).closest && (target as Element).closest('[data-ignore-outside]')) return;

		if (playBox.value && !playBox.value.contains(target)) {
			const target = 'profil';
			window.location.hash = target.startsWith('/') ? target : '/' + target;
		}
	};

	// Always listen when buttons are visible (nbr_players === 0)
	watch(nbr_players, (newValue, oldValue) => {
		if (newValue === 0) {
			document.addEventListener('pointerdown', handlePointerDownOutside, true);
		} else {
			document.removeEventListener('pointerdown', handlePointerDownOutside, true);
		}
	});

	onMounted(() => {
		if (nbr_players.value === 0) {
			document.addEventListener('pointerdown', handlePointerDownOutside, true);
		}
	});

	onUnmounted(() => {
		document.removeEventListener('pointerdown', handlePointerDownOutside, true);
	})

</script>
<template>
	<div ref="playBox">
		<div v-show="nbr_players === 0" class="select_offline_online_page">
			<button @click="chooseNbrPlayers(4)" class="select_button">
				<div class="play_title" data-i18n="play.4_players"></div>
			</button>
			<button @click="chooseNbrPlayers(8)" class="select_button">
				<div class="play_title" data-i18n="play.8_players"></div>
			</button>
		</div>
		<four_player v-if="nbr_players == 4" :setLanguage="props.setLanguage"></four_player>
		<eigth_player v-if="nbr_players == 8" :setLanguage="props.setLanguage"></eigth_player>
	</div>
		
</template>

<style scoped>

</style>