import { model } from '@medusajs/framework/utils';

export const PreOrderItemPickupOption = model.define(
	'pre_order_item_pickup_option',
	{
		id: model.id({ prefix: 'po_ipo' }).primaryKey(),
		option_slug: model.text(),
		name_th: model.text(),
		name_en: model.text().nullable(),
		is_upfront_payment: model.boolean().default(false),
		is_overide_unit_price: model.boolean().default(false),
		is_enabled_shipping: model.boolean().default(true),
		upfront_price: model.bigNumber().default(0),
		shipping_start_date: model.dateTime().nullable(),
		pickup_start_date: model.dateTime().nullable(),
		rank: model.number().default(0),
		pre_order_item_id: model.text(),
	},
);
