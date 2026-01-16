import {
	createWorkflow,
	transform,
	when,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import getAllCategoriesStep from './steps/get-all-categories';
import getBrandsStep from './steps/get-brands';
import mapCategoriesResponseStep from './steps/map-categories';
import mapBrandsToCategoryTreeStep from '../product/common/map-brands-to-category-tree-step';
import { useQueryGraphStep } from '@medusajs/medusa/core-flows';
import { MappedCategory } from './type';
import { cacheNavMenuStep } from './steps/cache-nav-menu';

type WorkflowInput = {
	isCached?: boolean;
};

const buildNavMenuWorkflow = createWorkflow(
	'build-nav-menu-workflow',
	(input: WorkflowInput) => {
		// Step 1: Get all categories from database
		const categoriesTree = getAllCategoriesStep();

		// Step 2: Map categories to required response format
		const mappedCategories = mapCategoriesResponseStep(categoriesTree);

		const categoryBrands = mapBrandsToCategoryTreeStep({
			categories: mappedCategories as MappedCategory[],
		});

		const { data: collections } = useQueryGraphStep({
			entity: 'product_collection',
			fields: ['id', 'title', 'handle'],
			filters: {
				metadata: {
					is_store_visible: true,
				},
			},
			pagination: {
				order: {
					metadata: {
						rank: 'ASC',
					},
				},
			},
		});

		const brands = getBrandsStep();

		const result = transform(
			{
				categoryBrands,
				collections,
				brands,
			},
			(input) => {
				return {
					categories: input.categoryBrands,
					collections: input.collections,
					brands: input.brands,
				};
			},
		);

		when(input, (input) => {
			return input.isCached === true;
		}).then(() => {
			// call the step for caching here
			cacheNavMenuStep({ data: result });
		});

		return new WorkflowResponse(result);
	},
);

export default buildNavMenuWorkflow;
