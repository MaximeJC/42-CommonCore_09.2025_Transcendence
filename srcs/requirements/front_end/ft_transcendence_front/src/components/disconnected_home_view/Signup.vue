<script setup lang="ts"> // Vue 3, Typescript
import { ref } from 'vue'; // fonction ref = cree une reference reactive: permet a Vue de suivre les changements de valeur et de maj le DOM automatiquement

	const props = defineProps<{ // fonction Vue pour declarer proprietes que le composant peut recevoir de son parent
			setLanguage: (lang: string) => void; // fonction qui prend une chaine de caracteres lang en parametre et ne retourne rien
		}>();

	// references reactives:
	const login = ref("");
	const email = ref("");
	const password = ref("");
	const conf_password = ref("");
	const message = ref("");
	const error_login = ref(false);
	const error_email = ref(false);
	const error_password = ref(false);
	const error_conf_password = ref(false);

	async function handleSubmit() { // fonction asynchrone appelee lors de la tentative de creation d'un nouvel utilisateur
		// reinitialiser les variables d'erreur et de message:
		error_login.value = false;
		error_email.value = false;
		error_password.value = false;
		error_conf_password.value = false;
		message.value = "";
	
		// verifier que mdp est correctement repete:
		if (password.value !== conf_password.value) {
			error_conf_password.value = true;
			message.value = "Passwords are not the same"; //todo langue
			return;
		}

		try {
			const result = await fetch(`http://${window.location.hostname}:3000/users`, { // envoie une requete HTTP via cet URL (au port 3000)
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					login: login.value, 
					email: email.value, 
					password: password.value,
				}),
			});
			if (!result.ok)
				throw new Error(`HTTP error! status: ${result.status}`);
			
			interface ServerResponse { // interface qui definit la structure des donnees attendues par le serveur
				success: boolean; // reussite de la requete
				message?: string; // message optionnel
			}
			const data: ServerResponse = await result.json();
			
			if (data.success) { // afficher un message et reinitialiser les variables
				message.value = "Account successfully created"; //todo langue
				login.value = "";
				email.value = "";
				password.value = "";
				conf_password.value = "";
			} else {
				if (data.message?.includes("login"))
					error_login.value = true;
				if (data.message?.includes("email"))
					error_email.value = true;
				message.value = data.message || "Subscription error"; //todo langue
			}
		} catch (err) {
			message.value = "Cannot contact server"; //todo langue
		}
	}
</script>

<template>
	<div class="frame-signup" title="sign-up_frame">
		<div class="signUpTitle" title="signup_title" data-i18n="header.signUp"></div>
		<form class="form_signup" @submit.prevent="handleSubmit">
			<label class="subtitle">
					<div data-i18n="Signup.login"></div>
			</label>
			<input class="input" type="login" id="login" v-model="login" required>
			<div  title="login-error" class="error"  >
					<div v-show="!error_login" data-i18n="Signup.login_error"></div>
			</div>
			<label class="subtitle">Email</label>
			<input class="input" type="email" id="email" v-model="email" required>
			<div  title="mail-error" class="error" >
				<div v-show=" !error_email" data-i18n="Signup.mail_error"></div>
			</div>
			<label class="subtitle">
					<div data-i18n="Signup.password"></div>
			</label>
			<input class="input" type="password" id="password" v-model="password" required>
			<div title="pasword-error" class="error"  >
				<div v-show=" !error_password" data-i18n="Signup.password_error"></div>

			</div>
			<label class="subtitle">
					<div data-i18n="Signup.conf_password"></div>
			</label>
			<input class="input" type="password" id="conf_password" v-model="conf_password" required>
			<div  title="conf_password-error" class="error" >
				<div v-show=" !error_conf_password" data-i18n="Signup.conf_password_error"></div>

			</div>
			<div title="line_button" class="line-button">
				<div class="icon-button">
					<button title="ft-signup" class="ft-button"></button>
				</div>
				<button title="Submit-button" class="Submit-button">
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

	.frame-signup{
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

	

	.signUpTitle{
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

	.form_signup{
		display: block;
	}

	.subtitle{
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

	.input{
		width: 25rem;
		font-size: 1.2em;
		margin-bottom: 0.5rem;
		border-radius: 20px;
		border: none;
	}

	.error{
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

		.line-button{
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.icon-button{
		display: flex;
		justify-content: end;
	}

	.ft-button{
		display:block;
		background: url("../../images/42logo.png");
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		background-color: #fbff22cc ;
		height: 5rem;
		width: 5rem;
		border-radius: 50%;
		border: 2px solid rgb(255, 255, 255);
		box-shadow: 
			0 0 10px #fbff22,
			0 0 20px #fbff22;
		cursor: pointer;
		transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;

	}

	.ft-button:hover{
		background-color: #dd0abacc ;

		border: 1px solid #ffffff;
		box-shadow: 
			0 0 10px #dd0aba,
			0 0 10px #dd0aba,
			0 0 20px #dd0aba,
			0 0 40px #dd0aba,
			0 0 120px #dd0aba;
	}


	.Submit-button{
		font-family: netron;
		background-color: rgba(251, 255, 34, 0.502);
		font-size: 2rem;
		text-align: center;
		color: white;
		border: 2px solid #caece8;
		text-shadow: 
		0 0 10px #fbff22,
		0 0 20px #fbff22;
		box-shadow: 
		0 0 5px #fbff22,
		0 0 10px #fbff22,
		0 0 20px #fbff22;
		padding: 0.2rem 1.3rem;
		border-radius: 20px;
		cursor: pointer;
		transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
	}

	.Submit-button > div{
		margin-top:  1rem;
		margin-bottom:  0.5rem;
	}

	.Submit-button:hover{
		background-color: #dd0abacc ;

		border: 2px solid #dd0aba;
		box-shadow: 
		0 0 5px #dd0aba,
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
	@media (max-width: 1600px) {
		.frame-signup{
			width: 40rem;
			padding: 2rem 3rem;
			margin-top: 3rem
		}
		.signUpTitle{
			font-size: 2.5rem;
			margin-bottom: 1rem;
		}
		.input{
		width: 40rem;
		font-size: 1.2em;
		}
		.error{
			font-size: 0.8rem;
		}
		.line-button{
			margin-top: 0.1rem;
		}
		.ft-button{
			height: 4.5rem;
			width: 4.5rem;
			margin-top: 0.2rem;
		}
		.Submit-button{
			margin-top: 0.4rem;

			font-size: 2rem;
			padding: 0.5rem 2rem;
		}
		.Submit-button > div{
			margin-top:  0.5rem;
		}

	}

	@media (max-width: 992px) {
    	
	}
	@media (max-width: 576px) {
    	
	}
</style>
