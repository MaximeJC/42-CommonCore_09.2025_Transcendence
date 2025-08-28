<script setup lang="ts">
import Head from '../components/Header.vue';
import Connexion from '../components/ConnexionButton.vue';
	import Signup from '@/components/Signup.vue';
	import { ref } from 'vue';

const props = defineProps<{
		setLanguage: (lang: string) => void;
	}>();

	const showSignup = ref(false);
	const toggleSignup = () => {
		showSignup.value = !showSignup.value;
		if (showConnection.value)
		showConnection.value = !showConnection.value;
	}
</script>


<template>
	<div>
		<div>
		<Head :setLanguage="props.setLanguage" @show-form="toggleSignup"></Head>
		</div>
		<div>
		<div class="pos-con-but">
				<Connexion :setLanguage="props.setLanguage" v-show="!showSignup && !showConnection" @show-connection="toggleConnection"></Connexion>
				<Signup :setLanguage="props.setLanguage" v-show="showSignup"></Signup>
			</div>
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
		transform: translate(-50%, -50%);
	}
</style>