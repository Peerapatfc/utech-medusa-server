import { model } from '@medusajs/framework/utils';
import ProductAttributeCategoryModel from './product-attribute-category';
import ProductAttributeOptionModel from './product-attribute-option';
import ProductAttributeToCategory from './product-attribute-to-category';

const ProductAttributeModel = model.define('product_attribute', {
	id: model.id({ prefix: 'pa' }).primaryKey(),
	title: model.text(),
	code: model.text().unique(),
	description: model.text().nullable(),
	is_filterable: model.boolean().default(false),
	is_required: model.boolean().default(false),
	is_unique: model.boolean().default(false),
	is_default: model.boolean().default(false),
	rank: model.number().default(0),
	metadata: model.json().nullable(),
	status: model.boolean().default(true),
	type: model.enum([
		'text',
		'textarea',
		'texteditor',
		'date',
		'datetime',
		'boolean',
		'multiselect',
		'select',
		'media_image',
		'swatch_visual',
		'swatch_text',
	]),
	use_in_product_variant: model.boolean().default(false),
	options: model.hasMany(() => ProductAttributeOptionModel, {
		mappedBy: 'attribute',
	}),
	categories: model.manyToMany(() => ProductAttributeCategoryModel, {
		pivotEntity: () => ProductAttributeToCategory,
	}),
});

export default ProductAttributeModel;
