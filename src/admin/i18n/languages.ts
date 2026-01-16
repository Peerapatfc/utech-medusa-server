import { enUS, th } from 'date-fns/locale';
import type { Language } from './types';

export const languages: Language[] = [
	{
		code: 'en',
		display_name: 'English',
		ltr: true,
		date_locale: enUS,
	},
	{
		code: 'th',
		display_name: 'Thai',
		ltr: false,
		date_locale: th,
	},
];
