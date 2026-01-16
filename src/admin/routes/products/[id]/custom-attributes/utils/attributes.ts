import type { ProductAttribute } from '../../../../../../types/attribute';

// Helper function to get the appropriate value for an attribute
const getAttributeValue = (
	metadata: Record<string, unknown>,
	attr: ProductAttribute,
): string | string[] => {
	if (!attr.code) return '';

	if (!(attr.code in metadata)) {
		if (attr.type === 'multiselect') return [];
		if (attr.type === 'select' || attr.type === 'swatch_visual') return 'none';
		return '';
	}

	if (attr.type === 'multiselect') {
		const value = metadata[attr.code];
		return typeof value === 'string' && value.includes(',')
			? value.split(',').map((v) => v.trim())
			: [];
	}

	if (attr.type === 'select' || attr.type === 'swatch_visual') {
		const value = metadata[attr.code];
		return typeof value === 'string' && value.length > 0 ? value : 'none';
	}

	const value = metadata[attr.code];
	return typeof value === 'string' ? value : '';
};

export const fetchAttributes = async (id: string) => {
	try {
		const [productResponse, attributesResponse] = await Promise.all([
			fetch(`/admin/products/${id}`, {
				credentials: 'include',
			}).then((res) => res.json()),
			fetch('/admin/product-attributes?status=true', {
				credentials: 'include',
			}).then((res) => res.json()),
		]);

		const metadata = productResponse.product.metadata || {};
		const selectedCategories = metadata.selected_category_ids || [];
		const allAttributes = attributesResponse.attributes;

		return {
			metadata,
			selectedCategories,
			allAttributes,
		};
	} catch (error) {
		return {
			metadata: {},
			selectedCategories: [],
			allAttributes: [],
		};
	}
};

export const fetchMultipleCategoryAttributes = async (
	categoryIds: string[],
) => {
	try {
		if (categoryIds.length === 0) {
			return [];
		}

		const attributesPromises = categoryIds.map((categoryId) =>
			fetch(`/admin/product-attribute-categories/${categoryId}/attributes`, {
				credentials: 'include',
			})
				.then((res) => {
					if (!res.ok) {
						throw new Error(
							`Failed to fetch attributes for category ${categoryId}: ${res.statusText}`,
						);
					}
					return res.json();
				})
				.then((data) => data.attributes)
				.catch(() => {
					return [];
				}),
		);

		const attributesArrays = await Promise.all(attributesPromises);

		const uniqueAttributes = new Map<string, ProductAttribute>();

		for (let i = 0; i < attributesArrays.length; i++) {
			const attributes = attributesArrays[i];

			for (const attr of attributes) {
				if (
					(attr.type === 'select' ||
						attr.type === 'multiselect' ||
						attr.type === 'swatch_visual') &&
					(!attr.options || attr.options.length === 0) &&
					attr.id
				) {
					try {
						const optionsResponse = await fetch(
							`/admin/product-attributes/${attr.id}/options`,
							{
								credentials: 'include',
							},
						);

						if (optionsResponse.ok) {
							const optionsData = await optionsResponse.json();
							attr.options = optionsData.options;
						}
					} catch (optError) {
						// Ignore option fetch errors
					}
				}

				if (attr.id && !uniqueAttributes.has(attr.id)) {
					uniqueAttributes.set(attr.id, attr);
				}
			}
		}

		return Array.from(uniqueAttributes.values());
	} catch (error) {
		return [];
	}
};

export const applyAttributeFilters = (
	attributeList: ProductAttribute[],
	metadata: Record<string, unknown>,
	selectedCategories: string[],
	categoryAttributes: ProductAttribute[],
	allAttributes: ProductAttribute[],
) => {
	// Create a set of existing attribute codes for quick lookups
	const existingCodes = new Set(attributeList.map((attr) => attr.code));

	// Map attributes by code for easy retrieval
	const existingAttributeMap = new Map(
		attributeList.map((attr) => [attr.code, attr]),
	);

	// Determine which attributes to display based on category selection
	let filteredAttributes: ProductAttribute[] = [];

	if (selectedCategories.length === 0) {
		// When no categories selected, show all metadata attributes
		// Also show default attributes from all available attributes
		const defaultAttributes = allAttributes.filter((attr) => attr.is_default);

		filteredAttributes = [...defaultAttributes];
	} else if (categoryAttributes.length > 0) {
		// When categories are selected and attributes are loaded

		// Get new attributes from selected categories
		const newAttributes = categoryAttributes.filter(
			(attr) => attr.code && !existingCodes.has(attr.code),
		);

		// Get existing attributes from selected categories (preserve values)
		const existingCategoryAttributes = categoryAttributes
			.filter((attr) => attr.code && existingCodes.has(attr.code))
			.map((attr) => existingAttributeMap.get(attr.code) || attr);

		// Get default attributes from all available attributes that aren't already included
		const defaultAttributes = allAttributes.filter((attr) => attr.is_default);

		// Combine all attributes with priority order
		filteredAttributes = [
			...newAttributes,
			...existingCategoryAttributes,
			...defaultAttributes,
		];
	} else {
		// When categories selected but no attributes loaded yet
		// Also show default attributes
		const defaultAttributes = allAttributes.filter(
			(attr) => attr.is_default && !existingCodes.has(attr.code),
		);
		filteredAttributes = [...attributeList, ...defaultAttributes];
	}

	// Map filtered attributes to form values with proper value handling
	const formValues = filteredAttributes
		.sort((a, b) => {
			// Sort by is_default (true first), then by rank, then by title
			if (a.is_default && !b.is_default) return -1;
			if (!a.is_default && b.is_default) return 1;
			if (a.rank !== undefined && b.rank !== undefined) {
				return a.rank - b.rank;
			}
			return (a.title || '').localeCompare(b.title || '');
		})
		.map((attr: ProductAttribute) => ({
			id: attr.id,
			code: attr.code || '',
			title: attr.title,
			value: getAttributeValue(metadata, attr),
			isNew: !existingCodes.has(attr.code),
		}));

	return {
		filteredAttributes,
		formValues,
	};
};
