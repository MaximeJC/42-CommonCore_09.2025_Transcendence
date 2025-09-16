<script setup lang="ts">
	import { ref, watch, onUnmounted, nextTick,computed } from 'vue';
	import con_home_view from './connected_home_view.vue'
	import Head from '../components/Header/Header.vue';
	import Connexion from '../components/disconnected_home_view/ConnexionButton.vue';
	import connection_form from '../components/disconnected_home_view/connection_form.vue';
	import Signup from '@/components/disconnected_home_view/Signup.vue';
	import setting from './setting_view.vue'
	import play_page from '../components/playable_page/play_page.vue'
// import { channel } from 'diagnostics_channel';

import { user } from '../user';
import type { User } from '../user';
const { setUser } = user();

	const props = defineProps<{
			setLanguage: (lang: string) => void;
		}>();

	let isConnect = ref(false);
	let issetting = ref(false);

	var checksession = async function session() {
		try {
			const response = await fetch(`http://${window.location.hostname}:3000/me` , {
				method :'GET',
				credentials: 'include'
			});
			const data = await response.json();
			// console.log("*****************************************");
			// console.log("Test data:");
			// console.log(data.user.login);
			// console.log("*****************************************");
			if (data.user?.login) {
				isConnect.value = true;
				setUser(data.user);
				// return isConnect;
			} else {
				isConnect.value = false;
				// return isConnect;
			}
			console.log("*********isConnect*1**************");
			console.log(isConnect.value);
			console.log("************************");
		} catch (err) {
				console.error("Erreur de session:", err);
		}
	};

	checksession();

	const showSignup = ref(false);

	const setting_activePage = ref('')

	const handleShowPage = (pageName: string) => {
		setting_activePage.value = pageName;
		if(setting_activePage.value != null)
			issetting.value = true;
		else
			issetting.value = false;
		console.log(issetting.value);
	};

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

	const toggleissettnig = () => {
		issetting.value = !issetting.value;

	}
	const show_play = ref(false);
	const toggleshow_play = () => {
		show_play.value = !show_play.value;

	}

	const connectionBox = ref<HTMLElement | null>(null);
	const signUpbox =  ref<HTMLElement | null>(null);
	const settingBox =  ref<HTMLElement | null>(null);
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
		if(settingBox.value && !settingBox.value.contains(target))
			{
				issetting.value = false;
			}
	}

	const anyOpen = computed(() => showConnection.value || showSignup.value || issetting.value);
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
		<Head :setLanguage="props.setLanguage" @show-form="toggleSignup"  @show-setting="toggleissettnig" @show_setting="handleShowPage" :isConnect="isConnect"></Head>
		</div>
		<div>
			<div v-show="!isConnect && !issetting" title="home_disconnect" class="home_disconnect" >
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
			<div v-show="isConnect && (!issetting && !show_play)" title="home_connect" class="home_connect" >
				<div>
					<con_home_view :isConnect="isConnect" @show_play="toggleshow_play" :setLanguage="props.setLanguage" ></con_home_view>
				</div>
			</div>
			<div class="home_connect" >
				<div ref="settingBox">
					<setting v-show="isConnect && issetting" :setLanguage="props.setLanguage" :setting_activePage="setting_activePage"></setting>
				</div>
			</div>
			<div class="home_connect" >
				<div v-show="isConnect && show_play">
					<play_page :setLanguage="props.setLanguage" :show_play="show_play"  @show_play="toggleshow_play"></play_page>
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