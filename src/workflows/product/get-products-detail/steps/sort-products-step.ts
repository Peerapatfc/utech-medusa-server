import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { ProductDTO } from '@medusajs/framework/types';

const sortProductsStep = createStep(
	'sort-products-step',
	async (
		{ products, productIds }: { products: ProductDTO[]; productIds: string[] },
		_,
	) => {
		if (!products || !productIds || !products.length || !productIds.length) {
			return new StepResponse({
				products: [],
			});
		}

		const sortedProductIds = productIds;
		const sortedProducts = products.sort((a, b) => {
			return sortedProductIds.indexOf(a.id) - sortedProductIds.indexOf(b.id);
		});

		return new StepResponse({
			products: sortedProducts,
		});
	},
);

export default sortProductsStep;
