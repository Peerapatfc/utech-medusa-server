import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './translations/en.json';
import thTranslations from './translations/th.json';

const localI18n = i18n.createInstance();

const lng = i18n.language;

localI18n.use(initReactI18next).init({
	debug: process.env.NODE_ENV === 'development',
	detection: {
		caches: ['cookie', 'localStorage', 'header'],
		lookupCookie: 'lng',
		lookupLocalStorage: 'lng',
		order: ['cookie', 'localStorage', 'header'],
	},
	resources: {
		en: {
			translation: enTranslations,
		},
		th: {
			translation: thTranslations,
		},
	},
	lng: lng,
	fallbackLng: 'en',
	interpolation: {
		escapeValue: false,
	},
});

export default localI18n;
