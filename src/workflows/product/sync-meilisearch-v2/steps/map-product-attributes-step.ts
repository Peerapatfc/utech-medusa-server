import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { ProductQuery } from '../type';
import { PRODUCT_ATTRIBUTE_MODULE } from '../../../../modules/product-attributes';
import ProductAttributeService from '../../../../modules/product-attributes/service';

export const mapProductAttributesStep = createStep(
	'map-product-attributes-step',
	async ({ products }: { products: ProductQuery[] }, { container }) => {
		const attributeModuleService: ProductAttributeService = container.resolve(
			PRODUCT_ATTRIBUTE_MODULE,
		);

		const attributes = await attributeModuleService.listProductAttributes(
			{
				is_filterable: true,
			},
			{ relations: ['options'], select: ['title', 'code', 'rank'] },
		);

		const brandAttribute = attributes.find((attr) => attr.code === 'brand');
		const restAttributes = attributes.filter((attr) => attr.code !== 'brand');

		for (const product of products) {
			const metadata = product.metadata || {};

			product.brand =
				brandAttribute?.options.find(
					(option) => option.value === metadata?.brand,
				)?.title || '';

			Object.entries(metadata).forEach(([key, value]) => {
				const attribute = restAttributes.find((attr) => attr.code === key);
				if (attribute) {
					const valueOption = attribute.options.find(
						(option) => option.value === value,
					);

					product.attributes = {
						...(product.attributes || {}),
						[attribute.title]: valueOption?.title,
					};
				}
			});
		}

		return new StepResponse(products);
	},
);
