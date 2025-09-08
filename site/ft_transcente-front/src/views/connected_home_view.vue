<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import player_frame from '../components/connected_player_frame.vue'
import leaderbord from '../components/leaderbord.vue';
import friendlist from '../components/friendlist.vue';


	
	const props = defineProps<{
			setLanguage: (lang: string) => void;
		}>();

		const leaderbordRef = ref<InstanceType<typeof leaderbord> | null>(null);
	const friendlistRef = ref<InstanceType<typeof friendlist> | null>(null);

		const setEqualHeight = () => {
    if (leaderbordRef.value && leaderbordRef.value.rootElement &&
        friendlistRef.value && friendlistRef.value.rootElement) {

        const height1 = leaderbordRef.value.rootElement.offsetHeight;
        const height2 = friendlistRef.value.rootElement.offsetHeight;

        const minHeight = Math.min(height1, height2);

        leaderbordRef.value.rootElement.style.height = `${minHeight}px`;
        friendlistRef.value.rootElement.style.height = `${minHeight}px`;
    }
};

	onMounted(() => {
		nextTick(() => {
			setEqualHeight();
		});
	});

</script>

<template>
	<div class="page">
		<player_frame :setLanguage="props.setLanguage"></player_frame>
		<div class="subpages">
			<leaderbord ref="leaderbordRef" :setLanguage="props.setLanguage"></leaderbord>
			<friendlist ref="friendlistRef" :setLanguage="props.setLanguage"></friendlist>
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