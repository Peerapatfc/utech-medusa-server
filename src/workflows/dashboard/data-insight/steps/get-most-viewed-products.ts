import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import type { ProductData } from './fetch-initial-product-data';

export type GetMostViewedProductsStepInput = {
	limit?: number;
	products: ProductData[];
};

export const getMostViewedProductsStep = createStep(
	'get-most-viewed-products-step',
	async (input: GetMostViewedProductsStepInput) => {
		const viewableProducts = input.products.filter(
			(p) => p.metadata && typeof p.metadata.view !== 'undefined',
		);

		const sortedProducts = viewableProducts
			.sort(
				(a, b) => Number(b.metadata?.view || 0) - Number(a.metadata?.view || 0),
			)
			.slice(0, input.limit || 5)
			.map((product) => ({
				product_id: product.id,
				product_title: product.title,
				count: Number(product.metadata?.view || 0),
			}));

		const chartData = sortedProducts;

		return new StepResponse(chartData);
	},
);
