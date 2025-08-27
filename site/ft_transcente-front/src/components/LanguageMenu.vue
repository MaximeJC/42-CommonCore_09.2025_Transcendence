<script setup lang="ts">
	const props = defineProps<{
		setLanguage: (lang: string) => void;
	}>();
	
</script>

<template>
	<div class="lang-menu-container">
		<button class="lang-menu-button">
			<img id="lang-flag-icon" class="lang-icon" src="" alt="flag" width="30" height="30"></img>
			<span data-i18n="header.language"></span>
		</button>
		<ul class="lang-options">
			<li>
				<button class="lang-button-option" @click="setLanguage('fr')">Français</button>
			</li>
			<li>
				<button  class="lang-button-option" @click="setLanguage('en')">English</button>
			</li>
			<li>
				<button  class="lang-button-option" @click="setLanguage('es')">Español</button>
			</li>
		</ul>
	</div>
  </template>

<style>

	.lang-menu-container{
	position: relative;
	display: inline-block;
	border-radius: 20px;
	}

	.lang-menu-button{
		gap: 14px;
		font-family: netron;
		background-color: rgba(156, 50, 133, 0.5);
		font-size: 200%;
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
		padding: 10px 20px;
		border-radius: 20px;
		cursor: pointer;
		transition:  background-color 0.3s ease, box-shadow 0.3s ease-in-out, text-shadow 0.3s ease-in-out, border 0.3s ease-in-out;
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
		top: 70%;
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
		padding: 10px 17px;
		border-radius: 5px;
		cursor: pointer;
	}

	.lang-button-option{
		position: relative;
		margin-bottom: 8px;
		font-family: netron;
		align-self: center;
		background-color: rgba(251, 255, 34, 0);
		border: none;
		text-align: center;
		font-size: 100%;
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
		margin-right: 15px;
		transform: translateY(10%); 
	}
</style>