<script setup lang="ts">
	import HomeView from './views/HomeView.vue';
	import fr from './Language/FR.json'
	import en from './Language/EN.json'
	import es from './Language/ES.json'

	const translations = {
    fr,
    en,
	es
	};        

	let currentLang = localStorage.getItem('lang') || 'fr';

	const updateText = (): void => {
		const elementsToTranslate: NodeListOf<HTMLElement> = document.querySelectorAll('[data-i18n]');
		const currentTranslation = translations[currentLang as keyof typeof translations];

		if (!currentTranslation) {
			console.error(`Traduction pour la langue "${currentLang}" non trouvée.`);
			return;
		}

		elementsToTranslate.forEach(element => {
			const key = element.getAttribute('data-i18n');
			if (key) {
				const translation = key.split('.').reduce((obj: any, part: string) => obj && obj[part], currentTranslation);
				if (translation) {
					element.textContent = translation;
				}
			}
		});

		const flagIconElement = document.getElementById('lang-flag-icon') as HTMLImageElement;
		if (flagIconElement) {
			if (currentTranslation.header.icon_lang) {
				flagIconElement.src = currentTranslation.header.icon_lang;
			}
		}
	};
	
	const setLanguage = (lang: string): void => {
		currentLang = lang;
		localStorage.setItem('lang', lang);
		updateText();
	};

	defineExpose({
		setLanguage
	});

	document.addEventListener('DOMContentLoaded', updateText);
</script>
<template>
	<div class="home-container"> 
		<HomeView :setLanguage="setLanguage" ></HomeView>
	</div>

</template>

<style scoped>
	.home-container{
		display: flex;
		height: 100vh;
		flex-direction: column;
		position: relative;
	}
</style>
