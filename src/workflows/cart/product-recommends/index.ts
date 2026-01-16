import {
	createWorkflow,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import { extractCategoriesStep } from './steps/extract-categories-step';
import { findRecommendationsStep } from './steps/find-recommendations-step';
import { getCartItemsStep } from './steps/get-cart-items-step';

export type WorkflowInput = {
	cartId: string;
	limit?: number;
};

const productRecommendsWorkflow = createWorkflow(
	'product-recommends-workflow',
	(input: WorkflowInput) => {
		// Step 1: Get cart items with their product categories
		const { cartItems } = getCartItemsStep({
			cartId: input.cartId,
		});

		// Step 2: Extract unique categories and product IDs from cart items
		const { categories, productIds } = extractCategoriesStep({
			cartItems,
		});

		// Step 3: Find recommended products in same categories (excluding cart items)
		const { recommendedProducts } = findRecommendationsStep({
			categories,
			productIds,
			limit: input.limit,
		});

		return new WorkflowResponse({
			recommendedProducts,
		});
	},
);

export default productRecommendsWorkflow;
