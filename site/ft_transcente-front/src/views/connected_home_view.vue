<script setup lang="ts">
	import { ref, onMounted, nextTick, watch } from 'vue';
	import player_frame from '../components/connected_home_view/connected_player_frame.vue'
	import leaderbord from '../components/connected_home_view/leaderbord.vue';
	import friendlist from '../components/connected_home_view/friendlist.vue';
	import histo from '@/components/connected_home_view/historic.vue';

	const historic = ref(false)
	const other_player = ref(false)
	
	const props = defineProps<{
		setLanguage: (lang: string) => void;
	}>();

	const togglehistoric = () => {
		historic.value = !historic.value;
	}

	const toggleother_player = () => {
		other_player.value = !other_player.value;
	}

</script>

<template>
	<div class="page">
		<player_frame
		    :setLanguage="props.setLanguage"
		    :other_player="other_player"
		    :historic="historic"
		    @show-other_player="toggleother_player"
		    @show-historic="togglehistoric">
		</player_frame>
		<div v-show="!historic && !other_player" title="leader+friend" class="subpages">
			<leaderbord @show-other_player="toggleother_player" :setLanguage="props.setLanguage" :other_player="other_player"></leaderbord>
			<friendlist @show-other_player="toggleother_player" :setLanguage="props.setLanguage" :other_player="other_player"></friendlist>
		</div>
		<div v-show="historic" tittle="historic" class="histo-container">
			<histo :setLanguage="props.setLanguage"></histo>
		</div>
	</div>
</template>

<style>
@font-face {
	font-family: "netron";
	src: url("../../fonts/netron.regular.otf") format("opentype");
	}

	.page{
		display: grid;
		grid-template-columns: 1fr;
		align-items: start;
		grid-auto-rows: min-content;
		gap: 1rem;
	}

	.subpages{
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
		align-items: flex-start;
		height: auto;
	}

	.histo-container{
		display: grid;
		grid-template-columns:1fr;
		gap: 1rem;
		align-items: flex-start;
		height: auto;
	}


</style>