import { ProductCategoryDTO } from '@medusajs/framework/types';
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { ProductQuery } from '../type';
import { Modules } from '@medusajs/framework/utils';

interface ProductCategoryDTOWithMPath extends ProductCategoryDTO {
	mpath: string;
}

export const mapCategoriesStep = createStep(
	'map-categories-step',
	async ({ products }: { products: ProductQuery[] }, { container }) => {
		const productService = container.resolve(Modules.PRODUCT);
		const allCategories = await productService.listProductCategories(
			{
				is_active: true,
			},
			{
				select: ['id', 'name', 'handle'],
			},
		);

		for (const product of products) {
			const productCategories =
				product.categories as ProductCategoryDTOWithMPath[];
			const parentCategoryMPaths = productCategories.map(
				(category) => category.mpath,
			);

			const parentCategoryIds = [
				...new Set(parentCategoryMPaths.flatMap((id) => id.split('.'))),
			];

			const categories = allCategories.filter((category) =>
				parentCategoryIds.includes(category.id),
			);

			product.categories = categories;
		}

		return new StepResponse(products);
	},
);
