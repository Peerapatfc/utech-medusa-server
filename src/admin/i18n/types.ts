import type { Locale } from 'date-fns';
import enUS from './translations/en.json';
import th from './translations/th.json';

const resources = {
	en: {
		translation: enUS,
	},
	th: {
		translation: th,
	},
} as const;

export type Resources = typeof resources;

export type Language = {
	code: string;
	display_name: string;
	ltr: boolean;
	date_locale: Locale;
};
