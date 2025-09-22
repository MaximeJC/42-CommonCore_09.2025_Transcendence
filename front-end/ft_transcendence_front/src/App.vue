<script setup lang="ts">
import { onMounted, nextTick } from 'vue';
import HomeView from './views/HomeView.vue';
import { setLanguage, updateText } from './service/translators';


onMounted(async () => {
  	await nextTick()
  	updateText()   // <-- c’est ça qu’il faut appeler au premier rendu
})

</script>
<template>
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
