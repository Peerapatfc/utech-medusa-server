import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { BuildProductFilterWorkflowInput } from '../index';
import type { RemoteQueryFilters } from '@medusajs/framework/types';
import {
	ContainerRegistrationKeys,
	ProductStatus,
} from '@medusajs/framework/utils';
import type ProductAttributeService from '../../../../modules/product-attributes/service';
import { PRODUCT_ATTRIBUTE_MODULE } from '../../../../modules/product-attributes';
import { getChildrenCategoryIds } from '../../../../utils/product-category';

const getCategoryStep = createStep(
	'get-category-step',
	async (input: BuildProductFilterWorkflowInput, context) => {
		const productAttributeService: ProductAttributeService =
			context.container.resolve(PRODUCT_ATTRIBUTE_MODULE);
		const query = context.container.resolve(ContainerRegistrationKeys.QUERY);

		const productIds = input.product_ids || [];
		const categoryIds = [];
		const filters: RemoteQueryFilters<'product'> = {
			// @ts-ignore
			status: ProductStatus.PUBLISHED,
		};

		if (input.category_id) {
			const childrenIds = await getChildrenCategoryIds({
				container: context.container,
				categoryIds: [input.category_id as string],
			});

			categoryIds.push(input.category_id, ...childrenIds);
			filters.categories = {
				id: {
					$in: [input.category_id, ...childrenIds],
				},
			};
		}

		if (input.collection_id) {
			filters.collection_id = input.collection_id;
		}

		if (input.brand_id) {
			const [brandAttribute] =
				await productAttributeService.listAllAttributesWithOptions({
					code: 'brand',
				});
			const brand = brandAttribute?.options.find(
				(o) => o.id === input.brand_id,
			);
			const brandValue = brand?.value;

			if (brandValue) {
				filters.metadata = {
					brand: brandValue,
				};
			}
		}

		if (input.product_ids && input.product_ids.length > 0) {
			filters.id = input.product_ids;
		}

		const { data: products } = await query.graph({
			entity: 'product',
			fields: ['*', 'categories.*'],
			filters,
		});

		// const categoryIds = products.flatMap((p) => p.categories.map((c) => c.id));

		if (!input.category_id) {
			for (const product of products) {
				const categories = product.categories.map((c) => c.id);
				categoryIds.push(...categories);
			}
		}
		productIds.push(...products.map((p) => p.id));

		return new StepResponse({
			productIds,
			categoryIds,
		});
	},
);

export default getCategoryStep;
