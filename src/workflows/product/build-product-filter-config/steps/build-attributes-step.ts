import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { PRODUCT_ATTRIBUTE_MODULE } from '../../../../modules/product-attributes';
import type ProductAttributeService from '../../../../modules/product-attributes/service';
import type { ProductFilterForm } from '../index';
import type { IProductModuleService, Logger } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

const buildAttributesStep = createStep(
	'build-attributes-step',
	async (input: { productIds: string[] }, context) => {
		const productService: IProductModuleService = context.container.resolve(
			Modules.PRODUCT,
		);
		const productAttributesService: ProductAttributeService =
			context.container.resolve(PRODUCT_ATTRIBUTE_MODULE);
		const { productIds } = input;

		const productsInCategories = await productService.listProducts(
			{
				id: productIds,
			},
			{
				select: ['metadata'],
			},
		);

		const productAttributes =
			await productAttributesService.listProductAttributes({
				is_filterable: true,
			});
		const whitelistAttributesAllowFilter = productAttributes.map((a) => a.code);

		// ************* Original version *************
		// const attributes: ProductFilterForm[] = [];

		// for await (const product of productsInCategories) {
		// 	const metadata = product.metadata;
		// 	if (!metadata) continue;

		// 	for await (const key of Object.keys(metadata)) {
		// 		if (!whitelistAttributesAllowFilter.includes(key)) continue;

		// 		const attrValue = metadata[key];

		// 		const [attrOption] =
		// 			await productAttributesService.listProductAttributeOptions(
		// 				{
		// 					value: attrValue,
		// 				},
		// 				{ take: 1, relations: ['attribute'] },
		// 			);

		// 		if (!attrOption) continue;

		// 		const existAttribute = attributes.find((a) => a.attribute === key);

		// 		if (!existAttribute) {
		// 			const options = [
		// 				{
		// 					id: attrOption?.id,
		// 					title: attrOption?.title,
		// 					value: attrOption?.value,
		// 					rank: attrOption?.rank,
		// 				},
		// 			];
		// 			attributes.push({
		// 				attribute: key,
		// 				title: attrOption?.attribute?.title || key,
		// 				filter_mode: 'checkbox',
		// 				options,
		// 			});
		// 		} else {
		// 			const existOption = existAttribute.options.find(
		// 				(o) => o.value === attrValue,
		// 			);
		// 			if (!existOption) {
		// 				existAttribute.options.push({
		// 					id: attrOption?.id,
		// 					title: attrOption?.title,
		// 					value: attrOption?.value,
		// 					rank: attrOption?.rank,
		// 				});
		// 			}
		// 		}
		// 	}
		// }
		// ************* End Original version *************

		// ************* Optimized version *************
		const attributesMap = new Map();
		// Process all products in parallel
		await Promise.all(
			productsInCategories.map(async (product) => {
				const metadata = product.metadata;
				if (!metadata) return;

				const validKeys = Object.keys(metadata).filter((key) =>
					whitelistAttributesAllowFilter.includes(key),
				);

				if (validKeys.length === 0) return;

				// Collect attribute values to fetch them in one batch
				const attributeValues = validKeys.map((key) => metadata[key]);

				// Fetch all attribute options in one request
				const attrOptions =
					await productAttributesService.listProductAttributeOptions(
						{ value: attributeValues },
						{ take: attributeValues.length, relations: ['attribute'] },
					);

				// Create a map for quick lookup
				const attrOptionsMap = new Map(
					attrOptions.map((option) => [option.value, option]),
				);

				for (const key of validKeys) {
					const attrValue = metadata[key];
					const attrOption = attrOptionsMap.get(attrValue as string);
					if (!attrOption) continue;

					if (!attributesMap.has(key)) {
						attributesMap.set(key, {
							attribute: key,
							title: attrOption.attribute?.title || key,
							filter_mode: 'checkbox',
							options: [],
						});
					}

					const existAttribute = attributesMap.get(key);
					const existsOption = existAttribute.options.some(
						(o) => o.value === attrValue,
					);

					if (!existsOption) {
						existAttribute.options.push({
							id: attrOption.id,
							title: attrOption.title,
							value: attrOption.value,
							rank: attrOption.rank,
						});
					}
				}
			}),
		);

		// Convert map back to an array if needed
		const attributes = Array.from(attributesMap.values());
		// ************* ENd Optimized version *************

		return new StepResponse(
			{
				attributes,
				productIds,
			},
			{
				previousData: {},
			},
		);
	},
	async ({ previousData }, context) => {},
);

export default buildAttributesStep;
