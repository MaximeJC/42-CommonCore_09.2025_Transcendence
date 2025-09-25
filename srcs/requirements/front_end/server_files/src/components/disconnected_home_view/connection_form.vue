<script setup lang="ts"> // Vue 3, Typescript
import { USER_MANAGEMENT_URL } from '@/config/config.js';
import { ref, reactive, onMounted } from 'vue'; // fonction ref = cree une reference reactive: permet a Vue de suivre les changements de valeur et de maj le DOM automatiquement
// import axios from 'axios';

import { user } from '../../user';
import type { User } from '../../user';
const { setUser } = user();
// axios.defaults.withCredentials = true;

const props = defineProps<{ // fonction Vue pour declarer proprietes que le composant peut recevoir de son parent
	setLanguage: (lang: string) => void; // fonction qui prend une chaine de caracteres lang en parametre et ne retourne rien
}>();

const emit = defineEmits(['isconnected']);

// references reactives:
const email = ref("");
const password = ref("");
const error_email = ref(false);
const error_password = ref(false);
const message = ref("");
const profile = reactive({ email: '' })

async function handleConnection() { // fonction asynchrone appelee lors de la tentative de connexion d'un utilisateur
		// reinitialiser les variables d'erreur et de message:
		error_email.value = false;
		error_password.value = false;
		message.value = "";

		try {
			const result = await fetch(`${USER_MANAGEMENT_URL}/login`, { // envoie une requete HTTP via cet URL (au port 3000)
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({
					email: email.value,
					password: password.value,
				}),
			});
			interface ServerResponse { // interface qui definit la structure des donnees attendues par le serveur
				success: boolean; // reussite de la requete
				message?: string; // message optionnel
				user?: User;
				field?: 'email' | 'password'; 
			}
			const data: ServerResponse = await result.json(); // conversion de resultat en objet javascript data de type ServerResponse
			
			console.log("*****************************************");
			console.log("Test data:");
			console.log(data.success, data);
			console.log("*****************************************");
			if (result.ok) { 
			message.value = `Welcome ${data.user?.login}!`
			console.log(message.value, "*******************");
			if (data.user)
				setUser(data.user);
			emit('isconnected'); // emission de l'evenement de connexion reussie
		} else {
			message.value = data.message || "Connexion error";
			console.log(message.value, "2*******************");
			if (data.field === 'email') { 
				error_email.value = true;
			} else if (data.field === 'password') {
				error_password.value = true;
			} else {
				error_email.value = true;
				error_password.value = true;
			}
		}
		await fetchProfile();
	} catch (err) {
		message.value = "Cannot contact server";
		error_email.value = true;
		error_password.value = true;
	}
}

	async function fetchProfile() {
		const res = await fetch(`${USER_MANAGEMENT_URL}/me`, {
			credentials: 'include'
		});
	}

	// onMounted(() => {
	// 	fetchProfile()
	// })
</script>

<template>
	<div class="frame-connection" title="connection_frame">
		<div class="connectionTitle" title="connection_title" data-i18n="home.connection"></div>
		<form @submit.prevent="handleConnection">
			<label class="c-subTitle">Email</label>
			<input class="c-input" type="email" id="email" v-model="email" required>
			<div class="c-error"  title="mail-error">
				<div v-show="error_email"  data-i18n="Signup.mail_error"></div>
			</div>
			<label class="c-subTitle">
					<div data-i18n="Signup.password"></div>
			</label>
			<input class="c-input" type="password" id="password" v-model="password" required>
			<div  title="pasword-error" class="c-error"  >
				<div v-show=" error_password" data-i18n="Signup.password_invalid"></div>
			</div>
			<div title="c-line_button" class="c-line-button">
				<div class="c-icon-button">
					<button title="c-ft-signup" class="c-ft-button"></button>
				</div>
				<button  type="submit" title="Submit-button" class="c-Submit-button">
					<div data-i18n="Signup.submit"></div>
				</button>
			</div>
		</form>
	</div>
</template>

<style>
@font-face {
	font-family: "netron";
	src: url("../../fonts/netron.regular.otf") format("opentype");
	}
	.frame-connection{
		width: 25rem;
		display: grid;
		grid-template-columns: 1fr;
		grid-auto-rows: min-content;
		justify-content: center;
		align-items: center;
		background-color: rgba(156, 50, 133, 0.5);
		border: 2px solid #e251ca;
		box-shadow: 
		0 0 5px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba;
		padding: 2rem 3rem;
		border-radius: 20px;
		transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
		margin-top: 3rem
	}

	.connectionTitle{
		display: flex;
		align-self: center;
		justify-content: center;
		font-family: netron;
		color: white;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #ff69b4,
		0 0 120px #dd0aba;
		font-size: 2.5rem;
		font-family: netron;
		color: white;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #ff69b4,
		0 0 120px #dd0aba;
		margin-bottom: 1rem;
	}

	.c-subTitle{
		font-family: netron;
		color: white;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #ff69b4,
		0 0 120px #dd0aba;
		font-size: 1.2rem;
		font-family: netron;
		color: white;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #ff69b4,
		0 0 120px #dd0aba;
	}

	.c-input{
		width: 25rem;
		font-size: 1.2rem;
		margin-bottom: 0.5rem;
		border-radius: 20px;
		border: none;
	}

	.c-error{
		font-family: netron;
		color: white;
		text-shadow: 
		0 0 10px #fd2d49,
		0 0 10px #fd2d49,
		0 0 20px #fd2d49,
		0 0 40px #fd2d49,
		0 0 80px #fd2d49,
		0 0 120px #fd2d49;
		font-size: 1rem;
		margin-bottom: 1.5rem;
	}

	.c-Submit-button{
		font-family: netron;
		background-color: rgba(251, 255, 34, 0.5);
		font-size: 2rem;
		color: white;
		border: 2px solid #caece8;
		text-shadow: 
		0 0 10px #fbff22,
		0 0 10px #fbff22;

		box-shadow: 
		0 0 5px #fbff22,
		0 0 10px #fbff22,
		0 0 20px #fbff22;
		padding: 0.5rem 1.3rem;
		border-radius: 20px;
		cursor: pointer;
		transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
	}

	.c-line-button{
		display: flex;
		margin-top: 1rem;
		justify-content: space-between;
		align-items: center;
		align-items:flex-start
	}

	.c-icon-button{
		display: flex;
		justify-content: end;
	}

	.c-ft-button{
		display:block;
		background: url("../../images/42logo.png");
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		background-color: rgba(251, 255, 34, 0.8) ;

		height: 5rem;
		width: 5rem;
		border-radius: 50%;
		border: 2px solid rgb(255, 255, 255);
		box-shadow: 
			0 0 10px #fbff22,
			0 0 10px #fbff22,
			0 0 20px #fbff22;
		cursor: pointer;
		transition: background-color 0.6s ease, box-shadow 0.3 ease-in-out;

	}

	.c-ft-button:hover{
		background-color: rgba(221, 10, 186, 0.8);

		box-shadow: 
			0 0 10px #dd0aba,
			0 0 10px #dd0aba,
			0 0 20px #dd0aba,
			0 0 40px #dd0aba,
			0 0 120px #dd0aba;
	}

	.c-Submit-button > div{
		margin-top:  1rem;
		margin-bottom:  0.5rem;
	}

	.c-Submit-button:hover{
		background-color: rgba(221, 10, 186, 0.5);
		border: 2px solid #ffffff;
		box-shadow: 
		0 0 5px rgb(221, 10, 186),
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #dd0aba;
		text-shadow: 
		0 0 5px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #dd0aba;
	}

</style>