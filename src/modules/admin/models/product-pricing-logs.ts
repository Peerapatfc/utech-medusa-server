import { model } from '@medusajs/framework/utils';

export const ProductPricingLog = model.define('product_pricing_logs', {
	id: model.id({ prefix: 'pp-log' }).primaryKey(),
	previous_amount: model.number().default(0).nullable(),
	new_amount: model.number().default(0).nullable(),
	product_id: model.text(),
	variant_id: model.text().nullable(),
	price_id: model.text().nullable(),
	actor_id: model.text().nullable(),
	metadata: model.json().nullable(),
});

export default ProductPricingLog;
