import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { ProductQuery } from '../type';
import { BigNumberValue } from '@medusajs/framework/types';

export const mapProductPriceStep = createStep(
	'map-product-price-step',
	async ({ products }: { products: ProductQuery[] }, { container }) => {
		for (const product of products) {
			let min_calculated_amount = null as BigNumberValue;
			let min_original_amount = null as BigNumberValue;
			let max_calculated_amount = null as BigNumberValue;
			let max_original_amount = null as BigNumberValue;

			const variants = product.variants;
			for (const variant of variants) {
				const variantCalculatedPrice =
					//@ts-ignore
					variant.calculated_price as CalculatedPriceSet;

				if (!variantCalculatedPrice) continue;

				min_calculated_amount =
					min_calculated_amount === null
						? variantCalculatedPrice.calculated_amount
						: Math.min(
								Number(min_calculated_amount),
								Number(variantCalculatedPrice.calculated_amount),
							);

				min_original_amount =
					min_original_amount === null
						? variantCalculatedPrice.original_amount
						: Math.min(
								Number(min_original_amount),
								Number(variantCalculatedPrice.original_amount),
							);
				max_calculated_amount =
					max_calculated_amount === null
						? variantCalculatedPrice.calculated_amount
						: Math.max(
								Number(max_calculated_amount),
								Number(variantCalculatedPrice.calculated_amount),
							);

				max_original_amount =
					max_original_amount === null
						? variantCalculatedPrice.original_amount
						: Math.max(
								Number(max_original_amount),
								Number(variantCalculatedPrice.original_amount),
							);
			}

			product.calculated_price = {
				min_calculated_amount,
				min_original_amount,
				max_calculated_amount,
				max_original_amount,
			};
		}

		return new StepResponse(products);
	},
);
