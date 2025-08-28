<script setup lang="ts">
import { ref } from 'vue';
	const props = defineProps<{
			setLanguage: (lang: string) => void;
		}>();
	const login = ref("");
	const email = ref("");
	const password = ref("");
	const conf_password = ref("");
	const handleSubmit = () => {
		//preparation envoie serveur
	}

	const error_login = ref(true);
	const error_email = ref(true);
	const error_password = ref(true);
	const error_conf_password = ref(true);
</script>

<template>
	<div class="frame-signup" title="sign-up_frame">
		<div class="signUpTitle" tittle="signup_tittle" data-i18n="header.signUp"></div>
		<form @submit.prevent="handleSubmit">
			<label class="subTittle">
					<div data-i18n="Signup.login"></div>
			</label>
			<input class="input" type="login" id="login" v-model="login" required>
			<div v-show=" !error_login" title="login-error" class="error" data-i18n="Signup.login_error" ></div>
			<label class="subTittle">Email</label>
			<input class="input" type="email" id="email" v-model="email" required>
			<div v-show=" !error_email" title="mail-error" class="error" data-i18n="Signup.mail_error" ></div>
			<label class="subTittle">
					<div data-i18n="Signup.password"></div>
			</label>
			<input class="input" type="password" id="password" v-model="password" required>
			<div v-show=" !error_password" title="pasword-error" class="error" data-i18n="Signup.password_error" ></div>
			<label class="subTittle">
					<div data-i18n="Signup.conf_password"></div>
			</label>
			<input class="input" type="conf_password" id="conf_password" v-model="conf_password" required>
			<div v-show=" !error_conf_password" title="conf_password-error" class="error" data-i18n="Signup.conf_password_error" ></div>
		</form>
		<div tittle="line_button" class="line-button">
			<div class="icon-button">
				<button tittle="google-signup" class="google-button"></button>
				<button tittle="ft-signup" class="ft-button"></button>
			</div>
			<button tittle="Submit-button" class="Submit-button">
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

	.frame-signup{
		width: 35vw;
    	height: 60vh;
		display: grid;
		grid-template-columns: 1fr;
		grid-template-rows: repeat(auto-fill, minmax(40px, 1fr 1fr));
		gap: 15px;
		justify-content: space-between;
		align-items: flex-start;
		background-color: rgba(156, 50, 133, 0.5);
		border: 2px solid #e251ca;
		box-shadow: 
		0 0 5px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba;
		padding: 20px 40px;
		border-radius: 20px;
		transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
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
		margin-bottom: 15px;
	}

	.subTittle{
		font-family: netron;
		color: white;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #ff69b4,
		0 0 120px #dd0aba;
		font-size: 1.5rem;
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
		width: 100%;
		font-size: 1rem;
		margin-bottom: 3px;
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
		margin-bottom: 10px;
	}

	.line-button{
		display: flex;
		margin-top: 40px;
		justify-content: space-between;
		align-items:flex-start
	}

	.icon-button{
		display: flex;
		justify-content: end;
	}

	.google-button{
		display:block;
		background: url("../../images/google.png");
		background-size: contain;

		height: 100px;
		width: 100px;
		border-radius: 50%;
		border: 1px solid rgb(255, 255, 255);
		box-shadow: 
			0 0 10px #74f09d,
			0 0 10px #74f09d,
			0 0 20px #74f09d,
			0 0 40px #74f09d;
		cursor: pointer;
	}

	.ft-button{
		display:block;
		background: url("../../images/42logo.png");
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
		height: 100px;
		width: 100px;
		border-radius: 50%;
		border: 1px solid rgb(255, 255, 255);
		box-shadow: 
			0 0 10px #74f09d,
			0 0 10px #74f09d,
			0 0 20px #74f09d,
			0 0 40px #74f09d;
		cursor: pointer;
		margin-left: 30px;
		margin-bottom: 20px;
	}

	.Submit-button{
		font-family: netron;
		background-color: rgba(156, 50, 133, 0.5);
		font-size: 350%;
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
		padding: 10px 20px;
		border-radius: 20px;
		cursor: pointer;
		transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
	}

	.Submit-button:hover{
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
</style>		display:block;
