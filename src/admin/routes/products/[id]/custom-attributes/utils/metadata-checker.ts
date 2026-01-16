import type {
	MetadataDuplicationResult,
	MetadataValidationConfig,
	ProductMetadataValidationResult,
} from '../types';

/**
 * Check if a metadata value is already used by another product
 * @param currentProductId - The ID of the current product (to exclude from check)
 * @param metadataKey - The metadata key to check (e.g., 'sku', 'barcode', 'model_number')
 * @param metadataValue - The metadata value to check
 * @returns Promise with validation result
 */
export const checkMetadataDuplicate = async (
	currentProductId: string,
	metadataKey: string,
	metadataValue: string,
): Promise<MetadataDuplicationResult> => {
	try {
		// Skip check if no value provided
		if (!metadataValue || metadataValue.trim() === '') {
			return {
				is_duplicate: false,
				metadata_key: metadataKey,
				metadata_value: metadataValue,
			};
		}

		// Use the generic API endpoint for metadata duplicate checking
		const queryParams = new URLSearchParams({
			metadata_key: metadataKey,
			metadata_value: metadataValue,
			current_product_id: currentProductId,
		});

		const response = await fetch(
			`/admin/custom/products/check-metadata-duplicate?${queryParams}`,
			{
				credentials: 'include',
			},
		);

		if (!response.ok) {
			console.error('Failed to check metadata duplicate via API');
			return {
				is_duplicate: false,
				metadata_key: metadataKey,
				metadata_value: metadataValue,
			};
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error checking metadata duplicate:', error);
		return {
			is_duplicate: false,
			metadata_key: metadataKey,
			metadata_value: metadataValue,
		};
	}
};

/**
 * Validate multiple metadata fields for duplicates
 * @param currentProductId - The ID of the current product
 * @param validationConfigs - Array of metadata validation configurations
 * @returns Promise with validation results
 */
export const validateMultipleMetadataFields = async (
	currentProductId: string,
	validationConfigs: MetadataValidationConfig[],
): Promise<ProductMetadataValidationResult> => {
	const fieldErrors: Record<string, string> = {};

	// Check each metadata field for duplicates
	for (const config of validationConfigs) {
		if (config.value && typeof config.value === 'string') {
			const result = await checkMetadataDuplicate(
				currentProductId,
				config.key,
				config.value,
			);

			if (result.is_duplicate && result.conflicting_product) {
				fieldErrors[config.key] =
					`${config.key.toUpperCase()} "${config.value}" is already used by "${result.conflicting_product.title}"`;
			}
		}
	}

	return {
		is_valid: Object.keys(fieldErrors).length === 0,
		field_errors: fieldErrors,
	};
};
