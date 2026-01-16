import { model } from '@medusajs/framework/utils';
import { PreOrderTemplateItem } from './pre-order-item';

export const PreOrderTemplate = model.define('pre_order_template', {
	id: model.id({ prefix: 'pot' }).primaryKey(),
	name_th: model.text(),
	name_en: model.text().nullable(),
	upfront_price: model.bigNumber().default(0),
	shipping_start_date: model.dateTime().nullable(),
	pickup_start_date: model.dateTime().nullable(),
	created_by: model.text().nullable(),
	metadata: model.json().default({}),
});
