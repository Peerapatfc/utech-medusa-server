import { model } from '@medusajs/framework/utils';

export const City = model.define('ms_city', {
	id: model.number().primaryKey(),
	name_th: model.text(),
	name_en: model.text(),
	province_id: model.number(),
});
