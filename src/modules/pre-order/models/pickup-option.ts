import { model } from '@medusajs/framework/utils';

export const PickupOption = model.define('po_pickup_option', {
	id: model.id({ prefix: 'pickup' }).primaryKey(),
	name_th: model.text(),
	name_en: model.text(),
	slug: model.text().unique(),
	is_upfront_payment: model.boolean().default(false),
	is_overide_unit_price: model.boolean().default(false),
	is_enabled_shipping: model.boolean().default(true),
	upfront_price: model.bigNumber().default(0),
	shipping_start_date: model.dateTime().nullable(),
	pickup_start_date: model.dateTime().nullable(),
	rank: model.number().default(0),
});
