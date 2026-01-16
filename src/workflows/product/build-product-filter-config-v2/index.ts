import {
	createWorkflow,
	WorkflowResponse,
	transform,
} from '@medusajs/framework/workflows-sdk';
import getAllCategoriesStep from './steps/get-all-categories-step';
import buildCategoryFilterWithCountsStep from './steps/build-category-filter-with-counts-step';
import buildAttributeFilterWithCountsStep from './steps/build-attribute-filter-with-counts-step';
import buildPriceStep from './steps/build-price-step';
import buildFinalStep from './steps/build-final-step';

export interface BuildProductFilterWorkflowInput {
	category_id?: string;
	collection_id?: string;
	brand_id?: string;
	product_ids?: string[];
	show_available_only?: boolean;
	filters?: Record<string, string | string[]>;
}

const buildProductFilterConfigV2 = createWorkflow(
	'build-product-filter-config-v2',
	(input: BuildProductFilterWorkflowInput) => {
		// Step 1: Get all active categories
		const categoriesResult = getAllCategoriesStep();

		// Step 2: Build category filter with global counts
		const categoryFilterInput = transform(
			{ input, categoriesResult },
			({ input, categoriesResult }) => ({
				allCategories: categoriesResult.allCategories,
				allCategoryIds: categoriesResult.allCategoryIds,
				activeCategories: categoriesResult.activeCategories,
				show_available_only: input.show_available_only,
			}),
		);
		const categoryFilter =
			buildCategoryFilterWithCountsStep(categoryFilterInput);

		// Step 3: Build attribute filter with input and categories data
		const attributeFilterInput = transform(
			{ input, categoriesResult },
			({ input, categoriesResult }) => ({
				...input,
				allCategories: categoriesResult.allCategories,
			}),
		);
		const attributeFilter =
			buildAttributeFilterWithCountsStep(attributeFilterInput);

		// Step 4: Build price filter with all applied filters
		const priceFilterInput = transform(
			{ input, categoriesResult },
			({ input, categoriesResult }) => ({
				...input,
				allCategories: categoriesResult.allCategories,
			}),
		);
		const priceFilter = buildPriceStep(priceFilterInput);

		// Step 5: Build final response combining all filter data
		const finalResult = buildFinalStep({
			categoryFilter,
			attributeFilter,
			priceFilter,
		});

		return new WorkflowResponse(finalResult);
	},
);

export default buildProductFilterConfigV2;
