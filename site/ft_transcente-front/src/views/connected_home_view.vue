<script setup lang="ts">
	import { ref, onMounted, nextTick, watch } from 'vue';
	import player_frame from '../components/connected_home_view/connected_player_frame.vue'
	import leaderbord from '../components/connected_home_view/leaderbord.vue';
	import friendlist from '../components/connected_home_view/friendlist.vue';


	
	const props = defineProps<{
		setLanguage: (lang: string) => void;
	}>();

</script>

<template>
	<div class="page">
		<player_frame :setLanguage="props.setLanguage"></player_frame>
		<div class="subpages">
			<leaderbord :setLanguage="props.setLanguage"></leaderbord>
			<friendlist :setLanguage="props.setLanguage"></friendlist>
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
</style>