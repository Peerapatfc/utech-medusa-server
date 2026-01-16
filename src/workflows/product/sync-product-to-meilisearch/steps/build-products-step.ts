import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { ProductDTO } from '@medusajs/framework/types';
import type { ProductMeiliSearch } from '../index';

const buildProductsStep = createStep(
	'build-products-step',
	async (input: { products: ProductDTO[] }, context) => {
		// const products =
		// 	(input.products &&
		// 		input.products.length > 0 &&
		// 		input.products.map((product) => {
		// 			const variant_sku = product.variants
		// 				? product.variants.map((v) => v.sku)
		// 				: [];

		// 			if (product.metadata?.sku) {
		// 				variant_sku.push(product.metadata.sku as string);
		// 			}

		// 			const sku = product.metadata?.sku;
		// 			product.metadata = undefined;

		// 			return {
		// 				...product,
		// 				sku,
		// 				variant_sku,
		// 				synced_at: new Date().toISOString(),
		// 			};
		// 		})) ||
		// 	([] as ProductMeiliSearch[]);

		const products = [] as ProductMeiliSearch[];
		for (const product of input.products) {
			const variant_sku = product.variants
				? product.variants.map((v) => v.sku)
				: [];
			const variant_title = product.variants
				? product.variants.map((v) => v.title)
				: [];

			const sku = product.metadata?.sku as string;

			const wishlist_count = (product.metadata?.wishlist_count as number) || 0;

			product.metadata = undefined;
			products.push({
				...product,
				sku,
				variant_sku,
				variant_title,
				synced_at: new Date().toISOString(),
				wishlist_count,
			});
		}

		return new StepResponse({
			products,
		});
	},
);

export default buildProductsStep;
