<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue';
import player_frame from '../components/connected_home_view/connected_player_frame.vue'
import leaderbord from '../components/connected_home_view/leaderbord.vue';
import friendlist from '../components/connected_home_view/friendlist.vue';
import histo from '@/components/connected_home_view/historic.vue';
import histo_other from '@/components/connected_home_view/historic_other.vue'

const historic = ref(false);
const other_player = ref(false);
const selectedPlayerLogin = ref<string | null>(null);

const props = defineProps<{
	setLanguage: (lang: string) => void;
}>();

const togglehistoric = () => {
	historic.value = !historic.value;
}

const toggleother_player = (login: string) => {
	other_player.value = !other_player.value;
	selectedPlayerLogin.value = login;
}

</script>

<template>
	<div class="page">
		<player_frame
		    :setLanguage="props.setLanguage"
		    :other_player="other_player"
		    :historic="historic"
		    @showOtherPlayer="toggleother_player"
		    @show-historic="togglehistoric">
		</player_frame>
		<div v-show="!historic && !other_player" title="leader+friend" class="subpages">
			<leaderbord @showOtherPlayer="toggleother_player" :setLanguage="props.setLanguage" :other_player="other_player"></leaderbord>
			<friendlist @showOtherPlayer="toggleother_player" :setLanguage="props.setLanguage" :other_player="other_player"></friendlist>
		</div>
		<div v-show="historic || other_player" title="historic" class="histo-container">
			<histo 
				v-show="historic" 
				:setLanguage="props.setLanguage">
			</histo>
			<histo_other 
				v-show="other_player" 
				:setLanguage="props.setLanguage"
				:playerLogin="selectedPlayerLogin">
			</histo_other>
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