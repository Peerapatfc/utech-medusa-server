import { model } from '@medusajs/framework/utils';

export const ProductView = model.define('product_view', {
	id: model.id({ prefix: 'pv' }).primaryKey(),
	product_id: model.text().index(),
	customer_id: model.text().index().nullable(),
	guest_id: model.text().index().nullable(),
});

export const ProductViewCount = model.define('product_view_count', {
	id: model.id({ prefix: 'pvc' }).primaryKey(),
	product_id: model.text().index(),
	customer_id: model.text().index().nullable(),
	guest_id: model.text().index().nullable(),
	view_count: model.number().default(0),
});
