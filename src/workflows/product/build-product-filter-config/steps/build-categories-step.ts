import type { IProductModuleService } from '@medusajs/framework/types';
import type { ProductFilterFormOption } from '../index';
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { Modules } from '@medusajs/framework/utils';

export interface BuildCategoriesResponse extends ProductFilterFormOption {}

const buildCategoriesCategoryStep = createStep(
	'build-categories-step',
	async (input: { categoryIds: string[] }, context) => {
		const productService: IProductModuleService = context.container.resolve(
			Modules.PRODUCT,
		);
		const { categoryIds } = input;

		if (!categoryIds && categoryIds.length === 0) {
			return new StepResponse({
				categories: [],
			});
		}

		const categories = await productService.listProductCategories(
			{
				id: categoryIds,
			},
			{
				select: ['id', 'name', 'handle', 'rank'],
				order: {
					rank: 'ASC',
				},
			},
		);

		const categoriesForm: BuildCategoriesResponse[] = categories.map(
			(category) => ({
				id: category.id,
				title: category.name,
				value: category.handle,
				rank: category.rank,
			}),
		);

		return new StepResponse({
			categories: categoriesForm,
		});
	},
);

export default buildCategoriesCategoryStep;
