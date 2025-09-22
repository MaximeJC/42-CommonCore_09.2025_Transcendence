<script setup lang="ts">
	import { ref, onMounted, computed, onUnmounted, nextTick, watch } from 'vue';
	import Connexion from '../components/disconnected_home_view/ConnexionButton.vue';
	import connection_form from '../components/disconnected_home_view/connection_form.vue';
	import Signup from '@/components/disconnected_home_view/Signup.vue';

	const props = defineProps<{
		setLanguage: (lang: string) => void;
		isConnect: boolean;
		Signup: boolean;
	}>();

	const showSignup = ref(false);
	const showConnection = ref(false);

	const emit = defineEmits(['isconnected']);


	const toggleSignup = () => {
		if(props.isConnect == false){
			showSignup.value = !showSignup.value;
			if (showConnection.value)
				showConnection.value = !showConnection.value;
		}
	}

	const toggleConnection = () => {
		showConnection.value = !showConnection.value;
	}

	watch(() => props.Signup, (newVal, oldVal) => {
		if (newVal !== oldVal) {
			toggleSignup();
		}
	});

	const connectionBox = ref<HTMLElement | null>(null);
	const signUpbox =  ref<HTMLElement | null>(null);
	const handlePointerDownOutside = (e: PointerEvent) => {
		const target = e.target as Node;
		if(connectionBox.value && !connectionBox.value.contains(target))
			{
				showConnection.value = false;
			}
		if(signUpbox.value && !signUpbox.value.contains(target))
			{
				showSignup.value = false;
			}
	
	}

	const anyOpen = computed(() => showConnection.value || showSignup.value);
	watch(anyOpen, (newValue) => {
		if (newValue) {
			nextTick(() => {
				document.addEventListener(
					'pointerdown',
					handlePointerDownOutside,
					{ capture: true}
				);
			})
		}	
		else {
			document.removeEventListener(
				'pointerdown',
				handlePointerDownOutside,
				{ capture: true}
			);
		}
	});

	onUnmounted(() => {
  document.removeEventListener('pointerdown', handlePointerDownOutside, { capture: true });
});

</script>

<template>
	<div>
		<Connexion :setLanguage="props.setLanguage" v-show="!showSignup && !showConnection" @show-connection="toggleConnection"></Connexion>
	</div>
	<div ref="signUpbox">
		<Signup :setLanguage="props.setLanguage" v-show="showSignup" @issignup="toggleSignup"></Signup>
	</div>
	<div ref="connectionBox">
		<connection_form :setLanguage="props.setLanguage" v-show="showConnection && !showSignup" @isconnected="emit('isconnected')"></connection_form>
	</div>
</template>

<style>

	

</style>