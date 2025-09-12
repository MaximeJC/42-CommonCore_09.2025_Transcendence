<script setup lang="ts">
	import con_home_view from './connected_home_view.vue'
	import Head from '../components/Header.vue';
	import Connexion from '../components/disconnected_home_view/ConnexionButton.vue';
	import connection_form from '../components/disconnected_home_view/connection_form.vue';
	import Signup from '@/components/disconnected_home_view/Signup.vue';
	import { ref, watch, onUnmounted, nextTick,computed } from 'vue';
import { channel } from 'diagnostics_channel';

	const props = defineProps<{
			setLanguage: (lang: string) => void;
		}>();

	let isConnect = ref(false);

	var checksession = async function session() {
		try {
			const response = await fetch('http://localhost:3000/me' , {
				method :'GET',
				credentials: 'include'
			});
			const data = await response.json();
			console.log("*****************************************");
			console.log("Test data:");
			console.log(data.user.login);
			console.log("*****************************************");
			if (data.user.login) {
				isConnect.value = true;
				// return isConnect;
			} else {
				isConnect.value = false;
				// return isConnect;
			}
		} catch (err) {
				console.error("Erreur de session:", err);
		}
	};

	checksession();

	const showSignup = ref(false);
	const toggleSignup = () => {
		if(isConnect.value == false){
			showSignup.value = !showSignup.value;
			if (showConnection.value)
				showConnection.value = !showConnection.value;
		}
		else if (isConnect.value == true){
			isConnect.value = !isConnect.value;
		}
	}

	const showConnection = ref(false);
	const toggleConnection = () => {
		showConnection.value = !showConnection.value;
	}

	const toggleisconnected = () => {
		isConnect.value = !isConnect.value;
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
		<Head :setLanguage="props.setLanguage" @show-form="toggleSignup" :isConnect="isConnect"></Head>
		</div>
		<div>
			<div v-show="!isConnect" tittle="home_disconnect" class="home_disconnect" >
				<div>
					<Connexion :setLanguage="props.setLanguage" v-show="!showSignup && !showConnection" @show-connection="toggleConnection"></Connexion>
				</div>
				<div ref="signUpbox">
					<Signup :setLanguage="props.setLanguage" v-show="showSignup"></Signup>
				</div>
				<div ref="connectionBox">
					<connection_form :setLanguage="props.setLanguage" v-show="showConnection && !showSignup" @isconnected="toggleisconnected"></connection_form>
				</div>
			</div>
			<div v-show="isConnect" tittle="home_connect" class="home_connect" >
				<div>
					<con_home_view :isConnect="isConnect" :setLanguage="props.setLanguage" ></con_home_view>
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
	}
</style>