import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { MedusaContainer } from '@medusajs/framework/types';
import ProductAttributeService from '../../../modules/product-attributes/service';
import { MappedCategory } from '../../nav-menu/type';

type StepInput = {
	categories: MappedCategory[];
};

const getBrandsByCategoryTreeStep = createStep(
	'get-brands-by-category-tree-step',
	async ({ categories }: StepInput, { container }) => {
		const brandOptions = await getBrandOptions({ container });
		if (!brandOptions.length) {
			return new StepResponse([]);
		}

		for (const category of categories) {
			const products = category.products || [];

			const brandValues = Array.from(
				new Set(
					products.map((p) => p.metadata?.brand).filter(Boolean) as string[],
				),
			);

			const categoryBrands = brandOptions
				.filter((option) => brandValues.includes(option.value))
				.map((option) => ({
					id: option.id,
					handle: option.value,
					title: option.title,
					thumbnail: (option.metadata?.image_url as string) || null,
				}));

			category.brands = categoryBrands || [];

			category.products = undefined;
		}

		return new StepResponse(categories);
	},
);

export default getBrandsByCategoryTreeStep;

const getBrandOptions = async ({
	container,
}: { container: MedusaContainer }) => {
	const productAttributeService: ProductAttributeService = container.resolve(
		'productAttributeModuleService',
	);
	const [brandAttribute] = await productAttributeService.listProductAttributes(
		{
			code: 'brand',
		},
		{
			relations: ['options'],
		},
	);

	return brandAttribute?.options || [];
};
