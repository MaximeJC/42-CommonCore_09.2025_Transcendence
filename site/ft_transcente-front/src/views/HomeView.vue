<script setup lang="ts">
	import con_pla_fra from '../components/connected_player_frame.vue'
	import Head from '../components/Header.vue';
	import Connexion from '../components/ConnexionButton.vue';
	import connection_form from '../components/connection_form.vue';
	import Signup from '@/components/Signup.vue';
	import { ref, watch, onUnmounted, nextTick,computed } from 'vue';

	const props = defineProps<{
			setLanguage: (lang: string) => void;
		}>();

	const isConnect = ref(true)

	const showSignup = ref(false);
	const toggleSignup = () => {
		showSignup.value = !showSignup.value;
		if (showConnection.value)
		showConnection.value = !showConnection.value;
	}

	const showConnection = ref(false);
	const toggleConnection = () => {
		showConnection.value = !showConnection.value;
	}

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
		<div>
		<Head :setLanguage="props.setLanguage" @show-form="toggleSignup"></Head>
		</div>
		<div>
			<div v-show="isConnect" tittle="home_disconnect" class="home_disconnect" >
				<div>
					<Connexion :setLanguage="props.setLanguage" v-show="!showSignup && !showConnection" @show-connection="toggleConnection"></Connexion>
				</div>
				<div ref="signUpbox">
					<Signup :setLanguage="props.setLanguage" v-show="showSignup"></Signup>
				</div>
				<div ref="connectionBox">
					<connection_form :setLanguage="props.setLanguage" v-show="showConnection && !showSignup"></connection_form>
				</div>
			</div>
			<div tittle="home_connect" class="home_connect" >
				<div>
					<con_pla_fra></con_pla_fra>
				</div>
			</div>
		</div>
	</div>
</template>

<style>

	.home_disconnect{
		display: flex;
		justify-content: center;
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.home_connect{
		display: flex;
		justify-content: center;
		/*position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);*/
	}
</style>