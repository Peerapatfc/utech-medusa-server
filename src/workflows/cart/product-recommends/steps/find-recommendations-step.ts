import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { SimpleCategory } from '../type';
import { ProductStatus } from '@medusajs/framework/utils';

type StepInput = {
	categories: SimpleCategory[];
	productIds: string[];
	limit?: number;
};

export const findRecommendationsStep = createStep(
	'find-recommendations-step',
	async ({ categories, productIds, limit = 8 }: StepInput, { container }) => {
		if (categories.length === 0) {
			return new StepResponse({
				recommendedProducts: [],
			});
		}

		const query = container.resolve(ContainerRegistrationKeys.QUERY);
		const allRecommendedProducts: string[] = [];

		// Try each category level (deepest to shallowest)
		for (const category of categories) {
			const { data: products } = (await query.graph({
				entity: 'product',
				fields: ['id'],
				filters: {
					id: {
						$nin: productIds,
					},
					categories: {
						id: {
							$eq: category.id,
						},
					},
					status: ProductStatus.PUBLISHED,
				},
				pagination: {
					take: limit,
					skip: 0,
				},
			})) as { data: { id: string }[] };

			// Add new products, avoiding duplicates
			const existingIds = new Set(allRecommendedProducts);
			const newProductIds = products
				.map((product) => product.id)
				.filter((id) => !existingIds.has(id));

			allRecommendedProducts.push(...newProductIds);

			// If we found any products in any category, stop here
			if (newProductIds.length > 0) {
				break;
			}
		}

		// Limit to requested amount
		const recommendedProducts = allRecommendedProducts.slice(0, limit);

		return new StepResponse({
			recommendedProducts,
		});
	},
);
