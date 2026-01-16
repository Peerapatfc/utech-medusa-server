import { model } from '@medusajs/framework/utils';
import ProductAttributeModel from './product-attribute';
import ProductAttributeCategoryModel from './product-attribute-category';

// Define a pivot entity for the junction table
const ProductAttributeToCategory = model.define(
	'product_attribute_to_category',
	{
		id: model.id({ prefix: 'patc' }).primaryKey(), // Explicitly define the primary key
		attribute: model.belongsTo(() => ProductAttributeModel, {
			mappedBy: 'categories',
		}),
		category: model.belongsTo(() => ProductAttributeCategoryModel, {
			mappedBy: 'attributes',
		}),
		metadata: model.json().nullable(),
	},
);

export default ProductAttributeToCategory;
