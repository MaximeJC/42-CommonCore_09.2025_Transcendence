<script setup lang="ts">
	import { ref, onMounted, nextTick, watch } from 'vue';
	import player_frame from '../components/connected_home_view/connected_player_frame.vue'
	import leaderbord from '../components/connected_home_view/leaderbord.vue';
	import friendlist from '../components/connected_home_view/friendlist.vue';
	import histo from '@/components/connected_home_view/historic.vue';

	const historic = ref(false)
	
	const props = defineProps<{
		setLanguage: (lang: string) => void;
	}>();

	const togglehistoric = () => {
		historic.value = !historic.value;
	}

</script>

<template>
	<div class="page">
		<player_frame :setLanguage="props.setLanguage" :historic="historic" @show-historic="togglehistoric" ></player_frame>
		<div v-show="!historic" title="leader+friend" class="subpages">
			<leaderbord :setLanguage="props.setLanguage"></leaderbord>
			<friendlist :setLanguage="props.setLanguage"></friendlist>
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
		display: flex;
		gap: 1rem;
		align-items: stretch;
		align-content: stretch;
		justify-content: stretch;
		height: auto;
	}


</style>