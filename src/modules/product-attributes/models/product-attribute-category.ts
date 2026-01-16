import { model } from '@medusajs/framework/utils';
import ProductAttributeModel from './product-attribute';
import ProductAttributeToCategory from './product-attribute-to-category';

const ProductAttributeCategoryModel = model.define(
	'product_attribute_category',
	{
		id: model.id({ prefix: 'pac' }).primaryKey(),
		name: model.text().searchable(),
		description: model.text().searchable().nullable(),
		rank: model.number().default(0),
		metadata: model.json().nullable(),
		status: model.boolean().default(true),
		attributes: model.manyToMany(() => ProductAttributeModel, {
			pivotEntity: () => ProductAttributeToCategory,
			onDelete: 'cascade',
		}),
	},
);

export default ProductAttributeCategoryModel;
