<script setup lang="ts">
import { onMounted, nextTick, ref } from 'vue';
import HomeView from './views/HomeView.vue';
import { setLanguage, updateText } from './service/translators';
import pop_up from '@/components/pop_up/pop_up_play.vue';

const pop_up_status = ref(true);

onMounted(async () => {
  	await nextTick()
  	updateText()   // <-- c’est ça qu’il faut appeler au premier rendu
})

</script>
<template>
	<pop_up v-if="!pop_up_status"></pop_up>
	<div class="home-container"> 
		<HomeView :setLanguage="setLanguage" ></HomeView>
	</div>

</template>

<style scoped>
	.home-container{
		display: flex;
		flex-direction: column;
		position: relative;
	}
</style>
