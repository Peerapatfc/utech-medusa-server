import { model } from '@medusajs/framework/utils';

export const PriceListCustom = model.define('price_list_custom', {
	id: model.id({ prefix: 'plcustom' }).primaryKey(),
	rank: model.number().default(0),
	is_flash_sale: model.boolean().default(false),
	products: model.json().nullable(),
	is_notification_sent: model.boolean().default(false),
	price_list_variants: model.hasMany(() => PriceListVariant),
});

export const PriceListVariant = model.define('price_list_variant', {
	id: model.id({ prefix: 'plvariant' }).primaryKey(),
	product_variant_id: model.text(),
	quantity: model.number().default(0),
	reserved_quantity: model.number().default(0),
	price_list_custom: model.belongsTo(() => PriceListCustom, {
		mappedBy: 'price_list_variants',
	}),
});
