<script setup lang="ts">
import { setLanguage, updateText } from '../../service/translators';
import { user } from '../../user';
import { USER_MANAGEMENT_URL } from '@/config/config.js';

const props = defineProps<{
	setLanguage: (lang: string) => void;
}>();

const { currentUser, updateUser } = user();

async function setNewLanguage(lang: string) {
	try {
		props.setLanguage(lang);
		updateUser({ language: lang });

		updateText();
		if (!currentUser || !currentUser.value) {
			console.log('Pas de currentUser -setNewLanguage');
			return;
		}
		const response = await fetch(`${USER_MANAGEMENT_URL}/users/setlanguage`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ login: currentUser.value.login, language: currentUser.value.language }),
		});
		if (!response.ok) {
			throw new Error('Failed to update language');
		}
		console.log(`Language updated to ${lang}`);
	} catch (error) {
		console.error('Error updating language:', error);
	}
}

</script>

<template>
	<div class="lang-menu-container">
		<button class="lang-menu-button">
			<img id="lang-flag-icon" class="lang-icon" src="" alt="flag" width="30" height="30"></img>
			<div data-i18n="header.language"></div>
		</button>
		<ul class="lang-options">
			<li>
				<button class="lang-button-option" @click="setNewLanguage('fr')">Français</button>
			</li>
			<li>
				<button  class="lang-button-option" @click="setNewLanguage('en')">English</button>
			</li>
			<li>
				<button  class="lang-button-option" @click="setNewLanguage('es')">Español</button>
			</li>
		</ul>
	</div>
  </template>

<style>

	.lang-menu-container{
		display: flex;
		position: relative;
		border-radius: 20px;
	}

	.lang-menu-button{
		position: relative;
		display: flex;
		width: 100%;
		height: 100%;
		justify-content:space-between;
		font-family: netron;
		background-color: rgba(156, 50, 133, 0.5);
		font-size: 2rem;
		color: white;
		border: 2px solid #e251ca;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #ff69b4,
		0 0 120px #dd0aba;
		box-shadow: 
		0 0 5px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba;
		padding: 0.5rem 2rem;
		border-radius: 20px;
		cursor: pointer;
		transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
	}

	.lang-menu-button > div{
		align-self: center;
		margin-top: 0.5rem;
	}

	.lang-menu-button:hover{
		background-color: rgba(251, 255, 34, 0.5);
		border: 2px solid #fbff22;
		box-shadow: 
		0 0 5px #fbff22,
		0 0 10px #fbff22,
		0 0 20px #fbff22,
		0 0 40px #fbff22,
		0 0 80px #fbff22;

		text-shadow: 
		0 0 10px #fbff22,
		0 0 10px #fbff22,
		0 0 20px #fbff22,
		0 0 40px #fbff22,
		0 0 80px #fbff22,
		0 0 120px #fbff22;

	}

	.lang-options{
		list-style: none;
		position: absolute;
		display: none;
		top: 4.3rem;
		left: -8;
		z-index: 10;
		box-sizing: border-box;
		align-self: center;
		text-align: center;
		background-color: rgba(251, 255, 34, 0,5);
		border: 2px solid #dd0aba;
		box-shadow: 
		0 0 5px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba;
		padding: 1rem 1.15rem;
		border-radius: 20px;
		cursor: pointer;
	}

	.lang-button-option{
		position: relative;
		margin-bottom: 1rem;
		font-family: netron;
		align-self: center;
		background-color: rgba(251, 255, 34, 0);
		border: none;
		text-align: center;
		font-size: 1.5rem;
		color: white;
		text-shadow: 
		0 0 10px #dd0aba,
		0 0 10px #dd0aba,
		0 0 20px #dd0aba,
		0 0 40px #dd0aba,
		0 0 80px #dd0aba,
		0 0 120px #dd0aba;
		transition: text-shadow 0.3s ease-in-out ;
	}

	.lang-button-option:hover{
		text-shadow: 
		0 0 10px #fbff22,
		0 0 10px #fbff22,
		0 0 20px #fbff22,
		0 0 40px #fbff22,
		0 0 80px #fbff22,
		0 0 120px #fbff22;
		cursor: pointer;
	}

	.lang-menu-container:hover .lang-options {
		display: block;
	}

	.lang-icon{
		position:relative;
		margin-bottom: 0.5rem;
		width: 3.5rem;
		height: 3.5rem;
		margin-right: 1rem;
		transform: translateY(10%); 
	}

	
</style>