export function parseFilterParams(
	query: Record<string, string | string[] | undefined>,
): Record<string, string | string[]> {
	const filters: Record<string, string | string[]> = {};

	for (const [key, value] of Object.entries(query)) {
		// Handle filter_ prefixed parameters
		if (key.startsWith('filter_')) {
			const filterKey = key.replace('filter_', '');
			if (Array.isArray(value)) {
				filters[filterKey] = value as string[];
			} else if (value && typeof value === 'string') {
				// Handle comma-separated values
				filters[filterKey] = value.includes(',') ? value.split(',') : value;
			}
		}
		// Handle direct filter parameters (price, brand, etc.)
		else if (key === 'price' || key === 'brand') {
			if (Array.isArray(value)) {
				filters[key] = value as string[];
			} else if (value && typeof value === 'string') {
				if (key === 'price') {
					filters[key] = value.replace('_', '-');
				} else {
					filters[key] = value.includes(',') ? value.split(',') : value;
				}
			}
		}

		// Handle any other attribute filters that might be passed directly
		else if (
			value &&
			typeof value === 'string' &&
			![
				'page',
				'sortBy',
				'q',
				'category',
				'product_ids',
				'brand_id',
				'collection_id',
				'show_available_only',
			].includes(key)
		) {
			filters[key] = value.includes(',') ? value.split(',') : value;
		}
	}

	return filters;
}
