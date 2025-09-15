<script setup lang="ts">
	import { ref, onMounted, nextTick, watch } from 'vue';
	const props = defineProps<{
			setLanguage: (lang: string) => void;
	}>();

	

</script>

<template>
	<div title="profil_container" class="profil_container">
		<div title="profile_title" class="profile_title" data-i18n="setting.profile"></div>
		<div class="avatar_container" title="avatar_container"> 
			<img src="./Url de l'avatar.png" tittle="Avatar" alt="Avatar" class="set_avatar" ></img>

			<form class="set_form" title="form_avatar">
				<label title="avatar_label" class="avatar_subtitle" data-i18n="setting.avatar" ></label>
				<div >
					<input title="avatar_input" class="set_input"></input>
					<button type="submit" title="avatar_button" class="set_button" data-i18n="Signup.submit" ></button>
					<!--<div>erorr</div>-->
				</div>
			</form>
		</div>
		<div class="set_container" title="mail_container">
			<form class="set_form" title="form_mail">
				<label title="mail_label" class="set_subtitle" data-i18n="setting.mail" ></label>
				<div class="set_sub_inp">
					<input title="mail_input" class="set_input"></input>
					<button type="submit" title="mail_button" class="set_button" data-i18n="Signup.submit" ></button>
					<!--<div>erorr</div>-->
				</div>
			</form>
		</div>
		<div class="set_container" title="login_container">
			<form class="set_form" title="form_login">
				<label title="login_label" class="set_subtitle" data-i18n="setting.login" ></label>
				<div class="set_sub_inp">
					<input title="login_input" class="set_input"></input>
					<button type="submit" title="login_button" class="set_button" data-i18n="Signup.submit" ></button>
					<!--<div>erorr</div>-->
				</div>
			</form>
		</div>
		<div class="set_container" title="password_container">
			<form class="set_form" title="form_password">
				<label title="password_label" class="set_subtitle" data-i18n="setting.password" ></label>
				<div class="set_sub_inp">
					<input title="password_input" class="set_input"></input>
					<button type="submit" title="password_button" class="set_button" data-i18n="Signup.submit" ></button>
					<!--<div>erorr</div>-->
				</div>
			</form>
		</div>
	</div>
</template>

<style>
@font-face {
	font-family: "netron";
	src: url("../../fonts/netron.regular.otf") format("opentype");
}
.profil_container{
	display: grid;
	grid-template-rows: min-content;
	grid-template-columns: 1fr;
	width: 42rem;
	background-color: rgba(156, 50, 133, 0.5);
	border: 2px solid #e251ca;
	box-shadow: 
	0 0 5px #dd0aba,
	0 0 10px #dd0aba,
	0 0 20px #dd0aba,
	0 0 40px #dd0aba;
	padding: 1rem 1rem;
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
	font-size: 1.5rem;
	margin-top: 1rem;
}

.avatar_container{
	display: grid;
	grid-template-columns: 0.35fr 1fr;
	align-items: center;
}
.set_container{
	display: grid;
	grid-template-columns: 1fr;
	align-items: center;
}

.set_avatar{
	display: block;
	background-image: url(../../../images/default_avatar.png);
	background-size: cover;
	border-radius: 50%;
	border:2px solid #e251ca;
	box-shadow: 
		0 0 5px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba;
	width: 10rem;
	height: 10rem;
}

.set_form{
	display: grid;
	grid-template-rows: 0.8fr 1fr ;
	align-content: center;
	margin-top: 2rem;
}

.avatar_subtitle{
	font-family: netron;
	margin-left: 6rem;
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

.set_subtitle{
	font-family: netron;
	margin-left: 6rem;
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

.set_sub_inp{
	display: flex;
	justify-content: end;}

.set_input{
	width: 22rem;
	font-size: 1.2rem;
	margin-bottom: 0.5rem;
	margin-right: 1rem;
	border-radius: 20px;
	border: none;
	
}

.set_button{
	font-family: netron;
	background-color: rgba(251, 255, 34, 0.5);
	font-size: 1rem;
	color: white;
	border: 2px solid #caece8;
	text-shadow: 
	0 0 10px #fbff22,
	0 0 10px #fbff22;

	box-shadow: 
	0 0 5px #fbff22,
	0 0 10px #fbff22,
	0 0 20px #fbff22;
	padding: 0.5rem 1rem;
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
</style>