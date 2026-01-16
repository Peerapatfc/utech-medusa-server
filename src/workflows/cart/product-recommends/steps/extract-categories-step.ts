import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { CartItem, SimpleCategory } from '../type';

type StepInput = {
	cartItems: CartItem[];
};

export const extractCategoriesStep = createStep(
	'extract-categories-step',
	async ({ cartItems }: StepInput) => {
		const productIds: string[] = [];
		let categories: SimpleCategory[] = [];

		// Collect all product IDs to exclude from recommendations
		for (const item of cartItems) {
			productIds.push(item.product_id);
		}

		// Get categories in hierarchy order for the latest item (deepest to shallowest)
		if (cartItems.length > 0) {
			const latestItem = cartItems[0];
			categories = getCategoriesInHierarchyOrder(latestItem.categories);
		}

		return new StepResponse({
			categories,
			productIds,
		});
	},
);

// Helper function to get categories ordered by hierarchy (deepest to shallowest)
const getCategoriesInHierarchyOrder = (
	categories: Array<SimpleCategory & { mpath?: string }>,
): SimpleCategory[] => {
	if (categories.length === 0) return [];

	// Sort categories by depth (deepest first)
	const categoriesWithDepth = categories.map((category) => {
		let depth = 1; // Default depth for categories without mpath

		if (category.mpath) {
			// mpath depth is determined by the number of dots + 1
			depth = category.mpath.split('.').length;
		}

		return {
			category: {
				id: category.id,
				name: category.name,
				handle: category.handle,
			} as SimpleCategory,
			depth,
		};
	});

	// Sort by depth descending (deepest first) and return categories
	return categoriesWithDepth
		.sort((a, b) => b.depth - a.depth)
		.map((item) => item.category);
};
