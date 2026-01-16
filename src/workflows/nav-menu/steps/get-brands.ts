import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { PRODUCT_ATTRIBUTE_MODULE } from '../../../modules/product-attributes';
import type ProductAttributeService from '../../../modules/product-attributes/service';
import type {
	ProductAttribute,
	AttributeOption,
} from '../../../types/attribute';

// Type definitions using existing types
type BrandOption = Pick<AttributeOption, 'id' | 'title' | 'value' | 'metadata'>;
type BrandAttribute = Pick<ProductAttribute, 'id'> & { options: BrandOption[] };

interface TransformedBrand {
	id: string;
	handle: string;
	title: string;
	thumbnail: string | null;
}

interface GroupedBrands {
	title: string;
	brands: TransformedBrand[];
}

// Step 2: Get all categories from database
const getBrandsStep = createStep('get-brands-step', async (_, context) => {
	const productAttribteModule: ProductAttributeService =
		context.container.resolve(PRODUCT_ATTRIBUTE_MODULE);

	const brandAttribute = await productAttribteModule.listProductAttributes(
		{
			code: 'brand',
		},
		{
			select: ['id', 'options.title', 'options.value', 'options.metadata'],
			relations: ['options'],
		},
	);

	// Transform the data to grouped format
	const transformedData = transformBrandsData(brandAttribute);

	return new StepResponse(transformedData);
});

// Helper function to transform brands data
function transformBrandsData(brandData: BrandAttribute[]): GroupedBrands[] {
	if (!brandData?.[0]?.options) {
		return [];
	}

	const brands = brandData[0].options;
	const groupedBrands: { [key: string]: TransformedBrand[] } = {};

	// Group brands by first letter
	for (const brand of brands) {
		const firstLetter = brand.title.charAt(0).toUpperCase();

		if (!groupedBrands[firstLetter]) {
			groupedBrands[firstLetter] = [];
		}

		groupedBrands[firstLetter].push({
			id: brand.id,
			handle: brand.value ?? '',
			title: brand.title ?? '',
			thumbnail: brand.metadata?.image_url || null,
		});
	}

	// Convert to array format and sort alphabetically
	const result = Object.keys(groupedBrands)
		.sort()
		.map((letter) => ({
			title: letter,
			brands: groupedBrands[letter].sort((a, b) =>
				a.title.localeCompare(b.title),
			),
		}));

	return result;
}

export default getBrandsStep;
