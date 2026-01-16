import type { ProductAttribute } from '@customTypes/attribute';

export interface MappedAttribute {
	value: string;
	isDefault: boolean;
}

export const mapProductAttributes = (
	productMetadata: Record<string, unknown> | null | undefined,
	productAttributes: ProductAttribute[],
): Record<string, MappedAttribute> => {
	if (!productMetadata || !productAttributes) return {};

	const mappedAttributes: Record<string, MappedAttribute> = {};

	const filteredProductMetadataKeys = Object.keys(productMetadata || {}).filter(
		(key) => productAttributes.some((attr) => attr.code === key),
	);

	for (const key of filteredProductMetadataKeys) {
		const productAttribute = productAttributes.find(
			(attr) => attr.code === key,
		) as ProductAttribute;

		const { title, code, options, is_default } = productAttribute;

		let attributeValue = '';
		if (code && productMetadata && code in productMetadata) {
			attributeValue = productMetadata[code] as string;
		}

		const displayTitle = title || '';

		let finalValue = attributeValue || '';

		if (options && attributeValue) {
			for (const option of options) {
				if (option.value === attributeValue) {
					finalValue = option.title;
					break;
				}
			}
		}

		mappedAttributes[displayTitle] = {
			value: finalValue,
			isDefault: is_default || false,
		};
	}

	return mappedAttributes;
};
