import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { ProductQuery } from '../type';

export const normalizeProductsStep = createStep(
	'normalize-products-step',
	async ({ products }: { products: ProductQuery[] }, { container }) => {
		for (const product of products) {
			product.metadata = undefined;
			product.sales_channels = undefined;
			product.variants = undefined;
		}

		return new StepResponse(products);
	},
);
