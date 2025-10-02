import fr from './../Language/FR.json'
import en from './../Language/EN.json'
import es from './../Language/ES.json'

const translations = {
fr,
en,
es
}; 

//export let act_lang: string;

export let currentLang: keyof typeof translations =
  (localStorage.getItem('lang') as keyof typeof translations) || 'fr'

export const updateText = (): void => {
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

export const setLanguage = (lang: string): void => {
	currentLang = lang as keyof typeof translations
	localStorage.setItem('lang', lang);
	updateText();
};

export const initTranslator = (): void => {
  document.addEventListener('DOMContentLoaded', updateText)
}

export const getCurrentLanguage = () => currentLang
