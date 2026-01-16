import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

const buildPriceStep = createStep(
	'build-price-step',
	async (input: { productIds: string[] }, context) => {
		const query = context.container.resolve(ContainerRegistrationKeys.QUERY);
		const { data: products } = await query.graph({
			entity: 'product',
			fields: ['*', 'variants.*', 'variants.prices.*'],
			filters: {
				id: {
					$in: input.productIds,
				},
			},
			pagination: {
				take: input.productIds.length,
				skip: 0,
			},
		});

		let highestPrice = 0;
		const productVariants = products.flatMap((product) => product.variants);
		for (const variant of productVariants) {
			// @ts-ignore
			if (!variant.prices || variant.prices.length === 0) continue;

			// @ts-ignore
			const sortedVariantPrice = variant.prices.sort(
				(a, b) => b.amount - a.amount,
			);

			const highestVariantPrice = sortedVariantPrice[0].amount;
			if (!highestVariantPrice) continue;

			if (highestVariantPrice > highestPrice) {
				highestPrice = highestVariantPrice;
			}
		}

		return new StepResponse({
			price: highestPrice,
		});
	},
);

export default buildPriceStep;
