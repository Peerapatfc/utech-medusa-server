import { model } from '@medusajs/framework/utils';

const PromotionDetailModel = model.define('promotion_detail', {
	id: model.id({ prefix: 'prode' }).primaryKey(),
	name: model.text().nullable(),
	description: model.text().nullable(),
	is_store_visible: model.boolean().default(true),
	metadata: model.json().nullable(),
	custom_rules: model.json().nullable(),
	is_new_customer: model.boolean().default(false),
	promotion_type: model.text().default('discount'),
});

export default PromotionDetailModel;
