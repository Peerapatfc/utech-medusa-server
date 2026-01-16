import { model } from '@medusajs/framework/utils';

export const SubDistict = model.define('ms_sub_district', {
	id: model.number().primaryKey(),
	name_th: model.text(),
	name_en: model.text(),
	city_id: model.number(),
	postal_code: model.text(),
});
