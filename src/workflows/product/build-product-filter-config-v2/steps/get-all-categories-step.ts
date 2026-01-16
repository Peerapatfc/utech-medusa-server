import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import type { ProductCategoryDTO } from '@medusajs/framework/types';

export interface GetAllCategoriesOutput {
	allCategories: ProductCategoryDTO[];
	allCategoryIds: string[];
	activeCategories: ProductCategoryDTO[];
}

const getAllCategoriesStep = createStep(
	'get-all-categories-step',
	async (input: undefined, context) => {
		const query = context.container.resolve(ContainerRegistrationKeys.QUERY);

		// Get all categories for global category filter
		const { data: allCategories } = (await query.graph({
			entity: 'product_category',
			fields: [
				'id',
				'name',
				'handle',
				'parent_category_id',
				'rank',
				'is_active',
			],
			filters: { is_internal: false },
			pagination: { order: { rank: 'ASC' } },
		})) as unknown as { data: ProductCategoryDTO[] };

		// Filter only active categories
		const activeCategories = allCategories.filter((cat) => cat.is_active);
		const allCategoryIds = allCategories.map(
			(cat: ProductCategoryDTO) => cat.id,
		);

		return new StepResponse({
			allCategories,
			allCategoryIds,
			activeCategories,
		});
	},
);

export default getAllCategoriesStep;
