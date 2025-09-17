<script setup lang="ts">
	import { ref, onMounted, nextTick, watch } from 'vue';
	const props = defineProps<{
			setLanguage: (lang: string) => void;
	}>();
	const new_avatar_src = ref("");
	const new_login = ref("");
	const new_email = ref("");
	const new_password = ref("");
	const conf_new_password = ref("");

	interface player{
		avatar: string
		email: string;
		login: string;
	}
		
	const act: player = {email: "test@test.fr", login: "test" , avatar: "../../../images/default_avatar.png"};
</script>

<template>
		<div title="profil_container" class="profil_container">
			<div title="profile_title" class="profile_title" data-i18n="setting.profile"></div>
			<div tittle="avatar container" class="info_container">
				<img :src="act.avatar"  class="set_avatar" />
				<div>
					<div title="act-mail" class="info_title">{{ act.login }}</div>
					<div title="act-login" class="info_title">{{ act.email }}</div>
				</div>
			</div>	
			<div title="avatar_container" class="set_container" > 
				<form title="form_avatar" class="set_form" >
					<label title="avatar_label" class="set_subtitle" data-i18n="setting.avatar" ></label>
					<div class="set_sub_inp">
						<input title="avatar_input" class="set_input" type="avatar_src" id="avatar_src" v-model="new_avatar_src" required></input>
						<button type="submit" title="avatar_button" class="set_button" data-i18n="Signup.submit" ></button>
					</div>
					<div class="set_error">source invalide</div>

				</form>
			</div>
			<div title="mail_container" class="set_container" >
				<form title="form_mail" class="set_form">
					<label title="mail_label" class="set_subtitle" data-i18n="setting.mail" ></label>
					<div class="set_sub_inp">
						<input title="mail_input" class="set_input" type="email" id="email" v-model="new_email"></input>
						<button type="submit" title="mail_button" class="set_button" data-i18n="Signup.submit" ></button>
					</div>
					<div class="set_error">email invalide</div>
				</form>
			</div>
			<div class="set_container" title="login_container">
				<form class="set_form" title="form_login">
					<label title="login_label" class="set_subtitle" data-i18n="setting.login" ></label>
					<div class="set_sub_inp">
						<input title="login_input" class="set_input" type="login" id="login" v-model="new_login"></input>
						<button type="submit" title="login_button" class="set_button" data-i18n="Signup.submit" ></button>
					</div>
					<div class="set_error">login invalide</div>

				</form>
			</div>
			<div class="set_container" title="password_container">
				<form class="set_form" title="form_password">
					<label title="password_label" class="set_subtitle" data-i18n="setting.password" ></label>
					<div class="set_sub_password">
						<div>
							<input title="password_input" class="set_input" type="password" v-model="new_password" />
							<label class="conf_password" data-i18n="Signup.conf_password"></label>
							<input title="conf_password_input" class="set_input" type="password" v-model="conf_new_password" />
						</div>
						<div class="pos_pass_button">
							<button type="submit" class="set_button" data-i18n="Signup.submit"></button>
						</div>
					</div>
					<div class="set_error">password invalide</div>
				</form>
			</div>
		</div>
</template>

<style>
@font-face {
	font-family: "netron";
	src: url("../../fonts/netron.regular.otf") format("opentype");
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
	background-image: url(../../../images/default_avatar.png);
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
	margin-top: 1rem;
}

.profil_container{
	display: grid;

	grid-template-rows: min-content;
	grid-template-columns: 1fr;
	width: 32rem;
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
	margin-top: 1rem;
}

.conf_password{
	display: block;
	margin-top: 0.5rem;
	font-family: netron;
	margin-left: 1rem;
	color: white;
	text-shadow: 
	0 0 10px #dd0aba,
	0 0 10px #dd0aba,
	0 0 20px #dd0aba,
	0 0 40px #dd0aba,
	0 0 80px #ff69b4,
	0 0 120px #dd0aba;
	font-size: 1rem;
	font-family: netron;
	color: white;
}

.set_subtitle{
	font-family: netron;
	margin-left: 1rem;
	color: white;
	text-shadow: 
	0 0 10px #dd0aba,
	0 0 10px #dd0aba,
	0 0 20px #dd0aba;
	font-size: 1.3rem;
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
	margin-top: -0.8rem;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr;
}

.set_sub_password > div{
	margin-bottom: 0.5rem;
}
	
.set_input{
	width: 22rem;
	font-size: 1.2rem;
	margin-right: 1rem;
	border-radius: 20px;
	margin-left: 0.8rem;
	border: none;
	
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
}
</style>