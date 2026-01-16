import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { ProductQuery } from '../type';
import {
	ContainerRegistrationKeys,
	getVariantAvailability,
} from '@medusajs/framework/utils';

export const mapProductQuantityStep = createStep(
	'map-product-quantity-step',
	async ({ products }: { products: ProductQuery[] }, { container }) => {
		const query = container.resolve(ContainerRegistrationKeys.QUERY);

		for (const product of products) {
			const salesChannelId = product.sales_channels[0].id;
			const variantIds = product.variants.map((variant) => variant.id);
			const availability = await getVariantAvailability(query, {
				variant_ids: variantIds,
				sales_channel_id: salesChannelId,
			});

			const totalAvailability = Object.values(availability).reduce(
				(sum, variant) => sum + variant.availability,
				0,
			);

			product.inventory_quantity = totalAvailability;
			product.in_stock = totalAvailability > 0;
		}

		return new StepResponse(products);
	},
);
