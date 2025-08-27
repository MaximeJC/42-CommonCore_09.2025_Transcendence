<script setup lang="ts">
import Head from '../components/Header.vue';
import Connexion from '../components/ConnexionButton.vue';

const props = defineProps<{
		setLanguage: (lang: string) => void;
	}>();
</script>


<template>
	<div>
		<Head :setLanguage="props.setLanguage"></Head>
		<div class="pos-con-but">
			<Connexion></Connexion>
		</div>
	</div>
</template>

<style>
	.pos-con-but{
		display: flex;
		justify-content: center;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translateX(-50%); 
	}
</style>