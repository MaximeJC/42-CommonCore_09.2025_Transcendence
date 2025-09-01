<script setup lang="ts">
import { ref } from 'vue';
	const props = defineProps<{
			setLanguage: (lang: string) => void;
		}>();
	const email = ref("");
	const password = ref("");
	const handleConnection = () => {
		//preparation envoie serveur
	}

	const error_email = ref(true);
	const error_password = ref(true);

</script>

<template>
	<div class="frame-connection" title="connection_frame">
		<div class="connectionTittle" tittle="connection_tittle" data-i18n="home.connection"></div>
		<form @submit.prevent="handleConnection">
			<label class="c-subTittle">Email</label>
			<input class="c-input" type="email" id="email" v-model="email" required>
			<div v-show=" !error_email" title="mail-error" class="c-error" data-i18n="Signup.mail_error" ></div>
			<div v-show=" !error_email" title="mail-error" class="c-error" data-i18n="Signup.mail_error" ></div>
			<label class="c-subTittle">
					<div data-i18n="Signup.password"></div>
			</label>
			<input class="c-input" type="password" id="password" v-model="password" required>
			<div v-show=" !error_password" title="pasword-error" class="c-error" data-i18n="Signup.password_error" ></div>
		</form>
		<div tittle="c-line_button" class="c-line-button">
			<div class="c-icon-button">
				<button tittle="c-google-signup" class="c-google-button"></button>
				<button tittle="c-ft-signup" class="c-ft-button"></button>
			</div>
			<button tittle="Submit-button" class="c-Submit-button">
				<div data-i18n="Signup.submit"></div>
			</button>
		</div>
	</div>
</template>

<style>
@font-face {
	font-family: "netron";
	src: url("../../fonts/netron.regular.otf") format("opentype");
	}
	.frame-connection{
		width: 40rem;

		display: flexbox;
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

	.connectionTittle{
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
		font-size: 3rem;
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

	.c-subTittle{
		font-family: netron;
		color: white;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #ff69b4,
		0 0 120px #dd0aba;
		font-size: 2rem;
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
		width: 40rem;
		font-size: 1.5rem;
		margin-bottom: 0.5rem;
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
		margin-bottom: 0.5rem;
	}

	.c-Submit-button{
		margin-top: 1rem;
		font-family: netron;
		background-color: rgba(156, 50, 133, 0.5);
		font-size: 3rem;
		color: white;
		border: 2px solid #caece8;
		text-shadow: 
		0 0 10px #74f09d,
		0 0 10px #74f09d,
		0 0 20px #74f09d,
		0 0 40px #74f09d,
		0 0 80px #74f09d,
		0 0 120px #74f09d;
		box-shadow: 
		0 0 5px #74f09d,
		0 0 10px #74f09d,
		0 0 20px #74f09d,
		0 0 40px #74f09d;
		padding: 0.5rem 2rem;
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

	.c-google-button{
		display:block;
		background: url("../../images/google.png");
		background-size: contain;
		background-color: rgba(116, 240, 157, 0.8) ;

		height: 5rem;
		width: 5rem;
		border-radius: 50%;
		border: 1px solid rgb(173, 250, 199);
		box-shadow: 
			0 0 10px #74f09d,
			0 0 10px #74f09d,
			0 0 20px #74f09d,
			0 0 40px #74f09d;
		cursor: pointer;
		margin-top: 1rem;
	}

	.c-google-button:hover{
		background-color: rgba(251, 255, 0, 0.8) ;

		border: 1px solid #fafd4e;
		box-shadow: 
			0 0 10px #fbff22,
			0 0 10px #fbff22,
			0 0 20px #fbff22,
			0 0 40px #fbff22,
			0 0 120px #fbff22;
	}

	.c-ft-button{
		display:block;
		background: url("../../images/42logo.png");
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		background-color: rgba(116, 240, 157, 0.8) ;

		height: 5rem;
		width: 5rem;
		border-radius: 50%;
		border: 1px solid rgb(173, 250, 199);
		box-shadow: 
			0 0 10px #74f09d,
			0 0 10px #74f09d,
			0 0 20px #74f09d,
			0 0 40px #74f09d;
		cursor: pointer;
		margin-left: 3rem;
		margin-top: 1rem;

	}

	.c-ft-button:hover{
		background-color: rgba(251, 255, 0, 0.8) ;

		border: 1px solid #fafd4e;
		box-shadow: 
			0 0 10px #fbff22,
			0 0 10px #fbff22,
			0 0 20px #fbff22,
			0 0 40px #fbff22,
			0 0 120px #fbff22;
	}

	.c-Submit-button > div{
		margin-top:  1rem;
	}

	.c-Submit-button:hover{
		background-color: rgba(251, 255, 34, 0.5);
		border: 2px solid #fbff22;
		box-shadow: 
		0 0 5px #fbff22,
		0 0 10px #fbff22,
		0 0 20px #fbff22,
		0 0 40px #fbff22,
		0 0 80px #fbff22;
		text-shadow: 
		0 0 5px #fbff22,
		0 0 10px #fbff22,
		0 0 20px #fbff22,
		0 0 40px #fbff22,
		0 0 80px #fbff22;
	}
</style>