import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import {
	ContainerRegistrationKeys,
	ProductStatus,
} from '@medusajs/framework/utils';
import {
	getAllDescendantIds,
	buildChildrenMap,
	type Category,
} from '../utils/category-utils';
import { PRODUCT_ATTRIBUTE_MODULE } from '../../../../modules/product-attributes';
import type ProductAttributeService from '../../../../modules/product-attributes/service';
import type { BaseFilterInput, ProductWithVariants } from '../type';

export interface BuildPriceInput extends BaseFilterInput {}

export interface BuildPriceOutput {
	maxPrice: number;
	minPrice: number;
}

/**
 * Calculate the maximum and minimum price from a list of products
 * @param products - Array of products with variants and prices
 * @returns Object with maximum and minimum price found across all product variants
 */
function calculatePriceRange(products: ProductWithVariants[]): {
	maxPrice: number;
	minPrice: number;
} {
	let maxPrice = 0;
	let hasValidPrice = false;

	for (const product of products) {
		if (!product.variants) continue;

		for (const variant of product.variants) {
			if (!variant.prices || variant.prices.length === 0) continue;

			for (const price of variant.prices) {
				if (price.amount > 0) {
					hasValidPrice = true;
					if (price.amount > maxPrice) {
						maxPrice = price.amount;
					}
				}
			}
		}
	}

	return {
		maxPrice: hasValidPrice ? maxPrice : 0,
		minPrice: 0,
	};
}

const buildPriceStep = createStep(
	'build-price-step-v3',
	async (input: BuildPriceInput, context) => {
		const query = context.container.resolve(ContainerRegistrationKeys.QUERY);
		const productAttributesService: ProductAttributeService =
			context.container.resolve(PRODUCT_ATTRIBUTE_MODULE);

		// Use allCategories from input or fetch if not provided
		const allCategories = input.allCategories || [];

		// Build children map for category hierarchy
		const childrenMap = buildChildrenMap(allCategories as Category[]);

		// Get all descendant category IDs for the given category
		const allCategoryIdsDescendant = input.category_id
			? getAllDescendantIds(input.category_id, childrenMap)
			: [];

		// Include the original category ID along with its descendants
		const categoryIdsToFilter = input.category_id
			? [input.category_id, ...allCategoryIdsDescendant]
			: [];

		const filters: Record<string, unknown> = {
			status: ProductStatus.PUBLISHED,
		};

		// Apply category filter if category_id is provided
		if (input.category_id) {
			filters.categories = { id: categoryIdsToFilter };
		}
		if (input.collection_id) {
			filters.collection_id = input.collection_id;
		}

		if (input.brand_id) {
			const [brandAttribute] =
				await productAttributesService.listAllAttributesWithOptions({
					code: 'brand',
				});
			const brand = brandAttribute?.options.find(
				(o) => o.id === input.brand_id,
			);
			const brandValue = brand?.value;

			if (brandValue) {
				filters.metadata = {
					brand: brandValue,
				};
			}
		}

		if (input.product_ids && input.product_ids.length > 0) {
			filters.id = input.product_ids;
		}

		// Apply additional filters from input.filters (excluding price filter)
		if (input.filters && Object.keys(input.filters).length > 0) {
			const metadataFilters: Record<string, unknown> = {};

			for (const [filterKey, filterValue] of Object.entries(input.filters)) {
				// Skip price filter as we're calculating price range
				if (filterKey === 'price') {
					continue;
				}

				// Handle brand filter specially since it uses brand_id parameter
				if (filterKey === 'brand' && !input.brand_id) {
					// If brand filter is provided but no brand_id, apply it as metadata filter
					if (Array.isArray(filterValue)) {
						metadataFilters[filterKey] = filterValue;
					} else {
						metadataFilters[filterKey] = filterValue;
					}
				} else if (filterKey !== 'brand') {
					// Apply other attribute filters as metadata filters
					if (Array.isArray(filterValue)) {
						metadataFilters[filterKey] = filterValue;
					} else {
						metadataFilters[filterKey] = filterValue;
					}
				}
			}

			// Merge metadata filters with existing metadata filters
			if (Object.keys(metadataFilters).length > 0) {
				filters.metadata = {
					...((filters.metadata as Record<string, unknown>) || {}),
					...metadataFilters,
				};
			}
		}

		// Apply show_available_only filter if enabled
		if (input.show_available_only) {
			filters.metadata = {
				...((filters.metadata as Record<string, unknown>) || {}),
				inventory_quantity: {
					$ne: null,
				},
			};
		}

		// Get products with their variants and prices
		const { data: products } = (await query.graph({
			entity: 'product',
			fields: ['id', 'variants.id', 'variants.prices.amount'],
			filters,
			pagination: {
				take: 50000,
				skip: 0,
			},
		})) as unknown as { data: ProductWithVariants[] };

		if (!products || products.length === 0) {
			return new StepResponse({ maxPrice: 0, minPrice: 0 });
		}

		const priceRange = calculatePriceRange(products);

		return new StepResponse(priceRange);
	},
);

export default buildPriceStep;
