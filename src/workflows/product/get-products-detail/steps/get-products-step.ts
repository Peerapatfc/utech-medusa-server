import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import {
	ContainerRegistrationKeys,
	QueryContext,
} from '@medusajs/framework/utils';
import type { ProductDTO } from '@medusajs/framework/types';
import type { GetProductDetailWorkflowInput } from '../index';

const getProductsStep = createStep(
	'get-products-step',
	async ({ productIds }: GetProductDetailWorkflowInput, context) => {
		const query = context.container.resolve(ContainerRegistrationKeys.QUERY);
		const { data: products } = (await query.graph({
			entity: 'product',
			fields: [
				'*',
				'type.*',
				'collection.*',
				'options.*',
				'tags.*',
				'images.*',
				'variants.*',
				'categories.handle',
				// @ts-ignore
				'variants.calculated_price.*',
			],
			filters: {
				id: {
					$in: productIds,
				},
			},
			context: {
				variants: {
					calculated_price: QueryContext({ currency_code: 'thb' }),
				},
			},
			pagination: {
				take: productIds.length,
				skip: 0,
			},
		})) as { data: ProductDTO[] };

		for (const product of products) {
			if (product.metadata) {
				// biome-ignore lint/complexity/useLiteralKeys: <explanation>
				product.metadata['legacy_data'] = undefined;
			}
		}

		return new StepResponse({
			products,
		});
	},
);

export default getProductsStep;
