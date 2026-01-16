import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import {
	getAllDescendantIds,
	buildChildrenMap,
	type Category,
} from '../utils/category-utils';
import {
	ContainerRegistrationKeys,
	ProductStatus,
} from '@medusajs/framework/utils';
import type { CategoryFilterForm, CategoryOption } from '../type';

export interface BuildCategoryFilterWithCountsInput {
	allCategories: Category[];
	allCategoryIds: string[];
	activeCategories: Category[];
	show_available_only?: boolean;
}

// Step to build category filter with global counts
const buildCategoryFilterWithCountsStep = createStep(
	'build-category-filter-with-counts-step',
	async (input: BuildCategoryFilterWithCountsInput, context) => {
		// Import the required dependencies

		const query = context.container.resolve(ContainerRegistrationKeys.QUERY);

		// Get all category IDs
		const allCategoryIds = input.allCategoryIds;
		const allCategories = input.allCategories;

		const globalCategoryCounts: Record<string, number> = {};

		if (allCategoryIds.length > 0) {
			// OPTIMIZED: Single query approach with post-processing for accurate counts

			// Build category hierarchy maps using ALL categories (active + inactive)
			const categoryMap = new Map<string, Category>();
			const childrenMap = buildChildrenMap(allCategories);

			for (const cat of allCategories) {
				categoryMap.set(cat.id, cat);
			}

			// Pre-calculate descendant mappings for all categories
			const categoryDescendantsMap = new Map<string, Set<string>>();
			for (const category of input.allCategories) {
				const descendants = getAllDescendantIds(category.id, childrenMap);
				categoryDescendantsMap.set(
					category.id,
					new Set([category.id, ...descendants]),
				);
			}

			// Get ALL category IDs (including inactive ones) for product fetching
			const allCategoryIdsIncludingInactive = allCategories.map(
				(cat: Category) => cat.id,
			);

			// Build filters for product query
			const productFilters: Record<string, unknown> = {
				categories: { id: allCategoryIdsIncludingInactive },
				status: ProductStatus.PUBLISHED,
			};

			// Add inventory filter if show_available_only is true
			if (input.show_available_only) {
				productFilters.metadata = {
					...((productFilters.metadata as Record<string, unknown>) || {}),
					inventory_quantity: {
						$ne: null,
					},
				};
			}

			// Single query to get all products with their categories (including products in inactive categories)
			const { data: allProducts } = (await query.graph({
				entity: 'product',
				fields: [
					'id',
					'categories.id',
					...(input.show_available_only
						? [
								'variants.manage_inventory',
								'variants.inventory_items.inventory.location_levels.available_quantity',
							]
						: []),
				],
				filters: productFilters,
				pagination: {
					take: 50000,
					skip: 0,
				},
			})) as unknown as { data: ProductWithCategories[] };

			interface ProductWithCategories {
				id: string;
				categories?: { id: string }[];
			}

			// Count products for each category by checking if product belongs to category or its descendants
			for (const category of allCategories) {
				const relevantCategoryIds = categoryDescendantsMap.get(category.id);
				if (!relevantCategoryIds) continue;

				const uniqueProducts = new Set<string>();

				for (const product of allProducts) {
					if (product.categories) {
						// Check if product belongs to this category or any of its descendants
						const belongsToCategory = product.categories.some((prodCat) =>
							relevantCategoryIds.has(prodCat.id),
						);

						if (belongsToCategory) {
							uniqueProducts.add(product.id);
						}
					}
				}

				globalCategoryCounts[category.id] = uniqueProducts.size;
			}
		}

		const categoryOptions = buildCategoryHierarchyWithGlobalCounts(
			input.allCategories,
			globalCategoryCounts,
		);

		const categoryFilter: CategoryFilterForm = {
			title: 'Category',
			attribute: '_category',
			filter_mode: 'link',
			options: categoryOptions,
		};

		return new StepResponse(categoryFilter);
	},
);

// Helper function to build category hierarchy with global counts
function buildCategoryHierarchyWithGlobalCounts(
	categories: Category[],
	globalCounts: Record<string, number>,
): CategoryOption[] {
	const categoryMap = new Map();

	// Create category nodes with global counts
	for (const category of categories) {
		if (!category.name || category.is_active === false) {
			continue;
		}

		const level = calculateCategoryLevel(category, categories);
		const count = globalCounts[category.id] || 0;

		categoryMap.set(category.id, {
			id: category.id,
			title: category.name,
			value:
				category.handle || category.name.toLowerCase().replace(/\s+/g, '-'),
			rank: category.rank || 0,
			level,
			parent_id: category.parent_category_id || null,
			children: [],
			count,
		});
	}

	const rootCategories: CategoryOption[] = [];

	// Build hierarchy
	for (const [, categoryNode] of categoryMap) {
		if (categoryNode.parent_id) {
			const parent = categoryMap.get(categoryNode.parent_id);
			if (parent) {
				parent.children.push(categoryNode);
			}
		} else {
			rootCategories.push(categoryNode);
		}
	}

	// Sort categories recursively
	const sortCategoriesRecursively = (cats: CategoryOption[]) => {
		cats.sort((a, b) => a.rank - b.rank);
		for (const cat of cats) {
			if (cat.children.length > 0) {
				sortCategoriesRecursively(cat.children);
			}
		}
	};

	sortCategoriesRecursively(rootCategories);
	return rootCategories;
}

// Helper function to calculate category level
function calculateCategoryLevel(
	category: Category,
	allCategories: Category[],
): number {
	if (!category.parent_category_id) {
		return 0;
	}

	const parent = allCategories.find(
		(cat) => cat.id === category.parent_category_id,
	);
	if (!parent) {
		return 1;
	}

	return 1 + calculateCategoryLevel(parent, allCategories);
}

export default buildCategoryFilterWithCountsStep;
