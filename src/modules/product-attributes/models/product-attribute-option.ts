import { model } from '@medusajs/framework/utils';
import ProductAttributeModel from './product-attribute';

const ProductAttributeOptionModel = model.define('product_attribute_option', {
	id: model.id({ prefix: 'pao' }).primaryKey(),
	title: model.text(),
	sub_title: model.text().nullable(),
	description: model.text().nullable(),
	value: model.text(),
	rank: model.number().default(0),
	metadata: model.json().nullable(),
	attribute: model.belongsTo(() => ProductAttributeModel, {
		mappedBy: 'options',
	}),
});

export default ProductAttributeOptionModel;
