import { model } from '@medusajs/framework/utils';

export const Province = model.define('ms_province', {
	id: model.number().primaryKey(),
	name_th: model.text(),
	name_en: model.text(),
});
