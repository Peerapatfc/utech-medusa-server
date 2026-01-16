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
import type {
	BaseFilterInput,
	ProductWithVariants,
	AttributeFilterOption,
	AttributeFilterForm,
} from '../type';

interface BuildAttributeFilterInput extends BaseFilterInput {}

const PAGINATION_LIMIT = 10000;
const buildAttributeFilterWithCountsStep = createStep(
	'build-attribute-filter-with-counts-step',
	async (input: BuildAttributeFilterInput, context) => {
		// Check if any filters are applied
		const hasActiveFilters = !!(
			input.brand_id ||
			input.show_available_only ||
			(input.filters && Object.keys(input.filters).length > 0)
		);

		const productAttributesService: ProductAttributeService =
			context.container.resolve(PRODUCT_ATTRIBUTE_MODULE);

		const query = context.container.resolve(ContainerRegistrationKeys.QUERY);

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

		// Apply product_ids filter - this is crucial for search results
		if (input.product_ids && input.product_ids.length > 0) {
			filters.id = input.product_ids;
		}

		// Apply additional filters from input.filters
		if (input.filters && Object.keys(input.filters).length > 0) {
			const metadataFilters: Record<string, unknown> = {};
			let priceFilter: { min?: number; max?: number } | null = null;

			for (const [filterKey, filterValue] of Object.entries(input.filters)) {
				// Handle price filter
				if (filterKey === 'price') {
					if (typeof filterValue === 'string') {
						const [minStr, maxStr] = filterValue.split('-');
						priceFilter = {
							min: minStr ? Number.parseFloat(minStr) : undefined,
							max: maxStr ? Number.parseFloat(maxStr) : undefined,
						};
					}
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

			// Apply price filter if present
			if (
				priceFilter &&
				(priceFilter.min !== undefined || priceFilter.max !== undefined)
			) {
				// Use metadata-based price filtering similar to the existing middleware
				filters.$or = [
					{
						metadata: {
							min_calculated_price: {
								$gte: priceFilter.min || 0,
								$lte: priceFilter.max || Number.MAX_SAFE_INTEGER,
							},
						},
					},
					{
						metadata: {
							max_calculated_price: {
								$gte: priceFilter.min || 0,
								$lte: priceFilter.max || Number.MAX_SAFE_INTEGER,
							},
						},
					},
				];
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

		// Get products with the applied filters
		const { data: products } = (await query.graph({
			entity: 'product',
			fields: [
				'id',
				'metadata',
				'variants.id',
				'variants.prices.amount',
				...(input.show_available_only
					? ['variants.manage_inventory', 'variants.inventory_quantity']
					: []),
			],
			filters,
			pagination: {
				take: PAGINATION_LIMIT,
				skip: 0,
				order: { created_at: 'DESC' },
			},
		})) as unknown as { data: ProductWithVariants[] };

		const attributeCounts: Record<string, Record<string, number>> = {};

		const allProductAttributes =
			await productAttributesService.listProductAttributes({
				is_filterable: true,
			});

		// Create a set of filterable attribute codes for quick lookup
		const filterableAttributeCodes = new Set(
			allProductAttributes
				.filter((attr) => attr.is_filterable === true)
				.map((attr) => attr.code)
				.filter(Boolean),
		);

		// Count attribute values from product metadata
		for (const product of products) {
			if (!product.metadata) continue;

			for (const [attributeCode, value] of Object.entries(product.metadata)) {
				// Skip if not a filterable attribute or value is null/undefined
				if (!filterableAttributeCodes.has(attributeCode) || value == null) {
					continue;
				}

				const stringValue = String(value);

				// Initialize attribute counts if not exists
				if (!attributeCounts[attributeCode]) {
					attributeCounts[attributeCode] = {};
				}

				// Increment count for this attribute value
				attributeCounts[attributeCode][stringValue] =
					(attributeCounts[attributeCode][stringValue] ?? 0) + 1;
			}
		}

		// Get initial visible options if filters are active
		const initialVisibleOptions: Set<string> = new Set();

		if (hasActiveFilters) {
			// Get base products without attribute filters to see what was initially visible
			const baseFilters: Record<string, unknown> = {
				status: ProductStatus.PUBLISHED,
			};
			if (input.category_id)
				baseFilters.categories = { id: categoryIdsToFilter };
			if (input.collection_id) baseFilters.collection_id = input.collection_id;
			if (input.product_ids?.length) baseFilters.id = input.product_ids;

			const { data: baseProducts } = (await query.graph({
				entity: 'product',
				fields: ['id', 'metadata'],
				filters: baseFilters,
				pagination: { take: PAGINATION_LIMIT, skip: 0 },
			})) as unknown as { data: ProductWithVariants[] };

			// Find which attribute values were visible initially
			for (const product of baseProducts) {
				if (!product.metadata) continue;
				for (const [code, value] of Object.entries(product.metadata)) {
					if (filterableAttributeCodes.has(code) && value != null) {
						initialVisibleOptions.add(`${code}:${String(value)}`);
					}
				}
			}
		}

		// Build attribute filters with options and counts
		const attributeFilters: AttributeFilterForm[] = [];

		// Build attribute filters for each filterable attribute
		for (const attribute of allProductAttributes) {
			const attributeCode = attribute.code;
			if (!attributeCode) {
				continue;
			}

			const valueCounts = attributeCounts[attributeCode] || {};

			// Get ALL possible values for this attribute
			const attributeOptions =
				await productAttributesService.listProductAttributeOptions(
					{ attribute_id: attribute.id },
					{ relations: ['attribute'] },
				);

			if (attributeOptions.length === 0) {
				continue;
			}

			// Group options by value to handle duplicates and avoid double counting
			const optionsByValue = new Map<string, AttributeFilterOption>();

			for (const option of attributeOptions) {
				const count = valueCounts[option.value] || 0;

				const existingOption = optionsByValue.get(option.value);

				if (existingOption) {
					// If duplicate value exists, keep the one with lower rank (higher priority)
					if (option.rank < existingOption.rank) {
						optionsByValue.set(option.value, {
							id: option.id,
							title: option.title,
							value: option.value,
							rank: option.rank,
							count: count,
						});
					}
					// If existing has better rank, keep it as is
				} else {
					// New unique value
					optionsByValue.set(option.value, {
						id: option.id,
						title: option.title,
						value: option.value,
						rank: option.rank,
						count: count,
					});
				}
			}

			let options = Array.from(optionsByValue.values()).sort(
				(a, b) => a.rank - b.rank,
			);

			// Filter based on context
			if (hasActiveFilters) {
				// Show only initially visible options
				options = options.filter((option) =>
					initialVisibleOptions.has(`${attributeCode}:${option.value}`),
				);
			} else {
				// First load: only show options with count > 0
				options = options.filter((option) => option.count > 0);
			}

			if (options.length > 0) {
				attributeFilters.push({
					attribute: attributeCode,
					title: attribute.title || attributeCode,
					filter_mode: 'checkbox',
					options,
				});
			}
		}

		return new StepResponse(attributeFilters);
	},
);
export default buildAttributeFilterWithCountsStep;
