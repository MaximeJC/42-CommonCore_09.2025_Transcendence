<script setup lang="ts">
	import { USER_MANAGEMENT_URL } from '@/config/config.js';
	import { ref, onMounted, nextTick, watch } from 'vue';
	import axios from 'axios';
	import { user } from '../../user';
	
	const { currentUser, updateUser } = user();

	const props = defineProps<{
			setLanguage: (lang: string) => void;
	}>();
	const new_avatar_src = ref("");
	const new_login = ref("");
	const new_email = ref("");
	const old_password = ref("");
	const new_password = ref("");
	const conf_new_password = ref("");

	const message = ref("");
	const error_file = ref(false);
	const error_login = ref(false);
	const error_email = ref(false);
	const error_login_used = ref(false);
	const error_email_used = ref(false);
	const error_password = ref(false);
	const error_conf_password = ref(false);

	interface player{
		avatar: string
		email: string;
		login: string;
	}
		
	// const act: player = {email: "test@test.fr", login: "test" , avatar: "..//images/default_avatar.png"};

	const avatarFile = ref<File | null>(null);
	const uploadedAvatar = ref("");
	const uploadedPseudo = ref("");
	const uploadedEmail = ref("");

	const handleAvatarChange = (event: Event) => {
		const input = event.target as HTMLInputElement;
		if (input.files && input.files[0]) {
			avatarFile.value = input.files[0];
		}
	};

	const getUserLogin = async function userLogin() {
		try {
			const response = await fetch(`${USER_MANAGEMENT_URL}/me` , {
				method :'GET',
				credentials: 'include',
			});

			if (response.ok) {
				const data = await response.json();
				return (data.user.login);
			}
			else 
				console.log("Erreur de recuperation du user");
		} catch (err) {
				console.error("Erreur de deconnexion:", err);
		}
	};

	const uploadAvatar = async () => {
		if (!avatarFile.value) {
			console.warn("AUcun fichier selectionne");
			return ;
		}
		const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
		if (!validTypes.includes(avatarFile.value.type)) {
			console.error("Fichier non valide");
			error_file.value = true;
			return ;
		}
		console.log("Fichier à uploader:", avatarFile.value);
		const formData = new FormData();
		formData.append("file", avatarFile.value);


		const userLogin = getUserLogin();

		try {
			const response = await axios.post(`${USER_MANAGEMENT_URL}/upload-avatar`, formData, {
				withCredentials: true,
				headers: {
				'Content-Type': undefined
				},
			});

			const result = response.data;
			console.log('Upload réussi:', result);

			if (result.avatar_url) {
				updateUser({ avatar_url: result.avatar_url });
				uploadedAvatar.value = `${result.avatar_url}?t=${new Date().getTime()}`;
			} else {
				console.error("Erreur lors de l'upload");
			}
		} catch (error) {
			console.error("Erreur lors de la requete:", error);
		}
	}

	async function handleEmail() {
		error_email.value = false;
		error_email_used.value = false;
		message.value = "";

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(new_email.value)) {
			error_email.value = true;
			return;
		}

		try {
			const result = await fetch(`${USER_MANAGEMENT_URL}/users/change-email`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: new_email.value, 
				}),
				credentials: 'include',
			});
			
			// console.log (" email = " + new_email.value);
			interface ServerResponse { // interface qui definit la structure des donnees attendues par le serveur
				success: boolean; // reussite de la requete
				message?: string; // message optionnel
				field?: 'email';
			}

			const data: ServerResponse = await result.json();
			// console.log("data Sever response: ", data);

			// verifier si login ou email presente dans DB
			if (!result.ok)
			{
				message.value = data.message || "An error occurred.";
				 if (data.field === 'email') {
					error_email_used.value = true;
					console.error("email deja utilise!");			
				}
				console.error("message.value = " + message.value);
				return;
			}
			
			if (data.success) {
				message.value = "Email successfully changed";
				uploadedEmail.value = new_email.value;
				updateUser({ email: uploadedEmail.value });
				new_email.value = "";
				console.log(message.value);
			} else {
				if (data.message?.includes("email"))
					error_email.value = true;
				message.value = data.message || "Email change error";
				console.log(message.value);
			}
		} catch (err) {
			message.value = "Cannot change email";
			console.error("Fetch error:", err); 
		}
	}

	async function handleLogin() {
		error_login.value = false;
		error_login_used.value = false;
		message.value = "";

		const loginLength = new_login.value.trim().length;
		if (loginLength < 3 || loginLength > 13) {
			error_login.value = true;
			return;
		}

		try {
			const result = await fetch(`${USER_MANAGEMENT_URL}/users/change-login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					login: new_login.value, 
				}),
				credentials: 'include',
			});
			
			console.log (" login = " + new_login.value);
			interface ServerResponse { // interface qui definit la structure des donnees attendues par le serveur
				success: boolean; // reussite de la requete
				message?: string; // message optionnel
				field?: 'login';
			}

			const data: ServerResponse = await result.json();
			// console.log("data Sever response: ", data);

			// verifier si login ou email presente dans DB
			if (!result.ok)
			{
				message.value = data.message || "An error occurred.";
				 if (data.field === 'login') {
					error_login_used.value = true;
					console.error("login deja utilise!");			
				}
				console.error("message.value = " + message.value);
				return;
			}
			
			if (data.success) {
				message.value = "Login successfully changed";
				uploadedPseudo.value = new_login.value;
				updateUser({ login: uploadedPseudo.value });

				new_login.value = "";
				console.log(message.value);
			} else {
				if (data.message?.includes("login"))
					error_login.value = true;
				message.value = data.message || "Login change error";
				console.log(message.value);
			}
		} catch (err) {
			message.value = "Cannot change login";
			console.error("Fetch error:", err); 
		}
	}


	async function handlePassword() {
		error_password.value = false;
		error_conf_password.value = false;
		message.value = "";
	
		if (new_password.value !== conf_new_password.value) {
			error_conf_password.value = true;
			old_password.value = "";
			new_password.value = "";
			conf_new_password.value = "";
			message.value = "Passwords are not the same";
			return;
		}

		try {
			const result = await fetch(`${USER_MANAGEMENT_URL}/users/change-password`, { // envoie une requete HTTP via cet URL (au port 3000)
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: currentUser?.value?.id ?? "",
					old_password: old_password.value,
					password: new_password.value,
				}),
				credentials: 'include',
			});
			
			const data = await result.json();

			// console.log("data: ", data);
			
			if (data.success) { // afficher un message et reinitialiser les variables
				message.value = "Password successfully changed";
				console.log("Password successfully changed");
				old_password.value = "";
				new_password.value = "";
				conf_new_password.value = "";
			} else {
				message.value = data.message || "Password error";
				error_password.value = true;
				old_password.value = "";
				new_password.value = "";
				conf_new_password.value = "";
			}
		} catch (err) {
			message.value = "Cannot change password";
			console.error("Fetch error:", err); 
		}
	}

</script>

<template>
		<div title="profil_container" class="profil_container">
			<div title="profile_title" class="profile_title" data-i18n="setting.profile"></div>
			<div tittle="avatar container" class="info_container">
			<img v-if="uploadedAvatar" :key="uploadedAvatar" :src="uploadedAvatar" alt="Nouvel avatar" class="set_avatar"/>
			<img v-else :key="currentUser?.avatar_url" :src="currentUser?.avatar_url" alt="Avatar actuel" class="set_avatar" />
				<div>
					<div v-if="uploadedEmail" title="act-mail" class="info_title">{{ currentUser?.email }}</div>
					<div v-else title="act-mail" class="info_title">{{ currentUser?.email }}</div>
					<div v-if="uploadedPseudo" title="act-login" class="info_title">{{ currentUser?.login }}</div>
					<div v-else title="act-login" class="info_title">{{ currentUser?.login }}</div>
				</div>
			</div>	
			<div title="avatar_container" class="set_container" > 
				<form title="form_avatar" class="set_form" @submit.prevent="uploadAvatar">
					<label title="avatar_label" class="set_subtitle" data-i18n="setting.avatar" ></label>
					<div class="set_sub_inp">
						<input title="avatar_input" class="set_input" type="file" id="avatar_src" required accept=".png, .jpg, .jpeg" @change="handleAvatarChange"></input>
						<button type="submit" title="avatar_button" class="set_button" data-i18n="Signup.submit" ></button>
					</div>
					<div title="pasword-error" class="set_error"  >
						<div v-show="error_file" data-i18n="setting.file_error"></div>
					</div>
				</form>
			</div>
			<div title="mail_container" class="set_container" >
				<form title="form_mail" class="set_form" @submit.prevent="handleEmail">
					<label title="mail_label" class="set_subtitle" data-i18n="setting.mail" ></label>
					<div class="set_sub_inp">
						<input title="mail_input" class="set_input" type="email" id="new_email" autocomplete="off" v-model="new_email"></input>
						<button type="submit" title="mail_button" class="set_button" data-i18n="Signup.submit" ></button>
					</div>
					<div title="email-error" class="set_error"  >
						<div v-show="error_email" data-i18n="setting.mail_error"></div>
						<div v-show="error_email_used" data-i18n="setting.mail_used_error"></div>
					</div>
				</form>
			</div>
			<div class="set_container" title="login_container">
				<form class="set_form" title="form_login" @submit.prevent="handleLogin">
					<label title="login_label" class="set_subtitle" data-i18n="setting.login" ></label>
					<div class="set_sub_inp">
						<input title="login_input" class="set_input" type="login" id="new_login" v-model="new_login"></input>
						<button  type="submit" title="login_button" class="set_button" data-i18n="Signup.submit" ></button>
					</div>
					<div title="login-error" class="set_error"  >
						<div v-show="error_login" data-i18n="setting.login_error"></div>
						<div v-show="error_login_used" data-i18n="setting.login_used_error"></div>
					</div>
				</form>
			</div>
			<div v-if="currentUser?.with42 === 0" class="set_container" title="password_container">
				<div class="password_inputs">
					<form class="set_form" title="form_password"  @submit.prevent="handlePassword">
						<label title="password_label" class="set_subtitle" data-i18n="setting.old_password" ></label>
						<div class="set_sub_inp">
							<input title="old_password_input" class="set_input" type="password" id="old_password" autocomplete="off" v-model="old_password" />
						</div>
						<div title="password-error" class="set_error"  >
							<div v-show="error_password" data-i18n="setting.password_invalid"></div>
						</div>
						<label title="password_label" class="set_subtitle" data-i18n="setting.password" ></label>
						<div class="set_sub_inp">
							<input title="password_input" class="set_input" type="password" id="new_password" autocomplete="off" v-model="new_password" />
						</div>
						<label class="set_subtitle" data-i18n="Signup.conf_password"></label>
						<div class="set_sub_inp">
							<input title="conf_password_input" class="set_input" type="password" id="repeat_new_password" autocomplete="off" v-model="conf_new_password" />
							<button type="submit" class="set_button" data-i18n="Signup.submit"></button>
						</div>
							<div title="password-error" class="set_error"  >
								<div v-show="error_conf_password" data-i18n="setting.conf_password_error"></div>
							</div>
					</form>
				</div>
			</div>
		</div>
</template>

<style>
@font-face {
	font-family: "netron";
	src: url("/fonts/netron.regular.woff2") format("woff2");
}

.info_container{
	display: flex;
	align-items: center;
	justify-content: space-evenly; 
}

.info_container > div{
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: min-content;
}

.set_avatar{
	display: block;
	/* background-image: url(..//images/default_avatar.png); */
	background-size:cover;
	background-repeat: no-repeat;
	border-radius: 50%;
	border:2px solid #e251ca;
	box-shadow: 
		0 0 5px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba;
	width: 7rem;
	height: 7rem;
}

.info_title{
	justify-self: start;
	font-family: netron;
	color: white;
	text-shadow: 
	0 0 10px #dd0aba,
	0 0 10px #dd0aba,
	0 0 20px #dd0aba,
	0 0 40px #dd0aba,
	0 0 80px #ff69b4,
	0 0 120px #dd0aba;
	font-size: 1.3rem;
	margin-bottom: 1rem;
}

.profil_container{
	display: grid;

	grid-template-rows: min-content;
	grid-template-columns: 1fr;
	/* width: 32rem;*/
	width: 100%;
	background-color: rgba(156, 50, 133, 0.5);
	border: 2px solid #e251ca;
	box-shadow: 
	0 0 5px #dd0aba,
	0 0 10px #dd0aba,
	0 0 20px #dd0aba,
	0 0 40px #dd0aba;
	padding: 1rem 1.2rem;
	border-radius: 20px;
}

.profile_title{
	justify-self: center;
	font-family: netron;
	font-weight: bold;
	color: white;
	text-shadow: 
	0 0 10px #dd0aba,
	0 0 10px #dd0aba,
	0 0 20px #dd0aba,
	0 0 40px #dd0aba,
	0 0 80px #ff69b4,
	0 0 120px #dd0aba;
	font-size: 1.8rem;
	margin-top: 1rem;
	margin-bottom: 1rem;
}

.set_container{
	display: grid;
	grid-template-columns: 1fr;
}

.set_form{
	display: grid;
	grid-template-columns: 1fr;
	grid-template-rows: 0.8fr 1fr;
}

.set_subtitle{
	font-family: netron;
	margin-left: 1rem;
	color: white;
	text-shadow: 
	0 0 10px #dd0aba,
	0 0 10px #dd0aba,
	0 0 20px #dd0aba;
	font-size: 1rem;
	font-family: netron;
	color: white;
}

.set_sub_inp{
	display: flex;
	align-items: center;
	margin-bottom: 0.5rem;

}

.set_sub_password {
	display: grid;
	margin-top: 1rem;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr;
}

.set_sub_password > div{
	margin-bottom: 0.5rem;
}
	
.set_input{
	width: 25rem;
	font-size: 1.2rem;
	margin-right: 1rem;
	border-radius: 20px;
	margin-left: 0.8rem;
	border: none;
	
}

.password_inputs {
	display: grid;
	row-gap: 1rem;
}

.set_button{
	font-family: netron;
	background-color: rgba(251, 255, 34, 0.5);
	font-size: 0.8rem;
	color: white;
	border: 2px solid #caece8;
	text-shadow: 
	0 0 10px #fbff22,
	0 0 10px #fbff22;
	box-shadow: 
	0 0 5px #fbff22,
	0 0 10px #fbff22;
	padding: 0.3rem 1rem;
	border-radius: 20px;
	cursor: pointer;
	transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;

}

.set_button:hover{
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

.pos_pass_button{
	align-self: last baseline;
	margin-bottom: 0.5rem;
}

.set_error{
	font-family: netron;
	color: white;
	text-shadow: 
	0 0 10px #fd2d49,
	0 0 10px #fd2d49,
	0 0 20px #fd2d49;
	font-size: 1rem;
	margin-left: 1rem;
	margin-top: 0.5rem;
}
</style>