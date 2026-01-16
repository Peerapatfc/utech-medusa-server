import type { ProductAttribute } from '../../../../../../types/attribute';
import type { MetadataValidationConfig } from '../types';

/**
 * Process form values and create updated metadata object
 * @param existingMetadata - The existing metadata
 * @param formValues - The form values
 * @param attributes - The attributes
 * @param allAttributes - The all attributes
 * @param selectedCategories - The selected categories
 * @returns The updated metadata
 */
export const processMetadataUpdate = (
	existingMetadata: Record<string, unknown>,
	formValues: {
		attributes: Array<{ code?: string; value?: string | string[] }>;
	},
	attributes: ProductAttribute[],
	allAttributes: ProductAttribute[],
	selectedCategories: string[],
): Record<string, unknown> => {
	const updatedMetadata = { ...existingMetadata };

	// Get all attribute codes from the attributes array
	const attributeCodes = new Set(attributes.map((attr) => attr.code));

	// Remove metadata entries that don't exist in attributes
	for (const key of Object.keys(updatedMetadata)) {
		if (
			key !== 'selected_category_ids' &&
			!attributeCodes.has(key) &&
			allAttributes.some((attr) => attr.code === key)
		) {
			delete updatedMetadata[key];
		}
	}

	// Update metadata with form values
	for (const attr of formValues.attributes) {
		if (attr.code) {
			if (attr.value === 'none') {
				updatedMetadata[attr.code] = '';
			} else if (attr.value === undefined || attr.value === null) {
				updatedMetadata[attr.code] = '';
			} else {
				updatedMetadata[attr.code] = Array.isArray(attr.value)
					? attr.value.join(', ')
					: attr.value;
			}
		}
	}

	updatedMetadata.selected_category_ids = selectedCategories;

	return updatedMetadata;
};

/**
 * Track which metadata fields were actually changed
 * @param formValues - The form values
 * @param existingMetadata - The existing metadata
 * @param allAttributes - The all attributes
 * @returns A set of changed fields
 */
export const getChangedFieldsAndIsUnique = (
	formValues: {
		attributes: Array<{ code?: string; value?: string | string[] }>;
	},
	existingMetadata: Record<string, unknown>,
	allAttributes: ProductAttribute[],
): Set<string> => {
	const changedFields = new Set<string>();

	for (const attr of formValues.attributes) {
		if (attr.code) {
			const newValue =
				attr.value === 'none' || attr.value === undefined || attr.value === null
					? ''
					: Array.isArray(attr.value)
						? attr.value.join(', ')
						: attr.value;

			const existingValue = existingMetadata[attr.code] || '';
			const isUnique = checkIsUnique(attr, allAttributes);
			// check if the attribute is unique
			if (!isUnique) {
				continue;
			}

			// Only track if the value actually changed
			if (newValue !== existingValue) {
				changedFields.add(attr.code);
			}
		}
	}

	return changedFields;
};

/**
 * Check if the attribute is unique
 * @param attribute - The attribute
 * @param allAttributes - The all attributes
 * @returns True if the attribute is unique, false otherwise
 */
export const checkIsUnique = (
	attribute: ProductAttribute,
	allAttributes: ProductAttribute[],
): boolean => {
	return (
		allAttributes?.find((attr) => attr.code === attribute.code)?.is_unique ??
		false
	);
};

/**
 * Build validation configs for changed metadata fields
 * @param updatedMetadata - The updated metadata object
 * @param changedFields - The set of changed fields
 * @returns An array of validation configurations
 */
export const buildValidationConfigs = (
	updatedMetadata: Record<string, unknown>,
	changedFields: Set<string>,
): MetadataValidationConfig[] => {
	const validation_configs: MetadataValidationConfig[] = [];

	for (const [key, value] of Object.entries(updatedMetadata)) {
		if (
			key !== 'selected_category_ids' &&
			changedFields.has(key) &&
			value &&
			typeof value === 'string' &&
			value.trim() !== ''
		) {
			validation_configs.push({
				key,
				value: value.trim(),
			});
		}
	}

	return validation_configs;
};
