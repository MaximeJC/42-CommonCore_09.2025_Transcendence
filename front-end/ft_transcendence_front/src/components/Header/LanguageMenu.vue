<script setup lang="ts">
	const props = defineProps<{
		setLanguage: (lang: string) => void;
	}>();
	
</script>

<template>
	<div class="lang-menu-container">
		<button class="lang-menu-button">
			<img id="lang-flag-icon" class="lang-icon" src="" alt="flag" width="30" height="30"></img>
			<div data-i18n="header.language"></div>
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
		/*margin-top: 0.5rem;*/
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
		margin-bottom: 0.4rem;
		width: 3rem;
		height: 3rem;
		margin-right: 1rem;
		transform: translateY(10%); 
	}

	@media (max-width: 1200px) {
		.lang-menu-button {
			font-size: 1.6rem;
			padding: 0.4rem 1.5rem;
		}

		.lang-icon {
			width: 2.3rem;
			height: 2.3rem;
		}

		.lang-options {
			top: 3.8rem;
			padding: 0.8rem 1rem;
		}

		.lang-button-option {
			font-size: 1.2rem;
		}
	}

	@media (max-width: 768px) {
		.lang-icon {
			margin-right: 0.5rem;
		}
	}

	@media (max-width: 480px) {
		.lang-menu-button {
			font-size: 1.6rem;
			padding: 0.3rem 1rem;
		}

		.lang-icon {
			width: 2.4rem;
			height: 2.4rem;
		}

		.lang-options {
			top: 3.2rem;
		}
	}

</style>