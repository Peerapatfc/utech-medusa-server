import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { ProductQuery } from '../type';

export const mapOtherFieldsStep = createStep(
	'map-other-fields-step',
	async ({ products }: { products: ProductQuery[] }) => {
		for (const product of products) {
			const metadata = product.metadata || {};

			product.sku = (metadata.sku || '') as string;
			product.wishlist_count = (metadata.wishlist_count as number) || 0;
			product.variant_sku = product.variants.map((variant) => variant.sku);
			product.variant_title = product.variants.map((variant) => variant.title);
			product.short_description = (metadata.short_description || '') as string;
		}

		return new StepResponse(products);
	},
);
