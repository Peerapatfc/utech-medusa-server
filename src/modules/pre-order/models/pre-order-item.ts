import { model } from '@medusajs/framework/utils';
import { PreOrderTemplate } from './pre-order-template';

export const PreOrderTemplateItem = model.define('pre_order_item', {
	id: model.id({ prefix: 'po_item' }).primaryKey(),
	product_id: model.text(),
	pre_order_template_id: model.text(),
});
