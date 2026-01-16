import { IMPORT_TYPE_OPTIONS } from './constants';

export const getImportTypeTitle = (type: string) => {
	const importType = IMPORT_TYPE_OPTIONS.find(
		(option) => option.value === type,
	);
	return importType?.label || 'unknown';
};
