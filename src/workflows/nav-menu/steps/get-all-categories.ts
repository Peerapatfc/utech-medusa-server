import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { IProductModuleService } from '@medusajs/types';
import { Modules } from '@medusajs/utils';

// Step 1: Get all categories from database
const getAllCategoriesStep = createStep(
	'get-all-categories-step',
	async (_, context) => {
		const productModuleService: IProductModuleService =
			context.container.resolve(Modules.PRODUCT);

		// Get root categories with complete descendant trees using Medusa's built-in tree feature
		const rootCategoriesWithTrees =
			await productModuleService.listProductCategories(
				{
					is_active: true,
					is_internal: false,
					include_descendants_tree: true,
					parent_category_id: null,
				},
				{
					select: [
						'id',
						'handle',
						'name',
						'rank',
						'metadata',
						'category_children.id',
						'category_children.handle',
						'category_children.name',
						'category_children.rank',
						'category_children.metadata',
						'products.metadata',
						'products.thumbnail',
						'products.status',
						'products.updated_at',
					],
					order: { rank: 'ASC' },
					relations: ['products'],
				},
			);

		return new StepResponse(rootCategoriesWithTrees);
	},
);

export default getAllCategoriesStep;
