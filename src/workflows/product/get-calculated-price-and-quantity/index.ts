import {
	createWorkflow,
	transform,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import { useQueryStep } from 'src/workflows/common';
import getProductsQuantityStep from '../get-products-detail/steps/get-product-quantity-step';
import { QueryContext } from '@medusajs/framework/utils';
import type { ProductDTO } from '@medusajs/framework/types';

export type WorkflowInput = {
	productId: string | string[];
};

const getCalculatePriceAndQuantityWorkflow = createWorkflow(
	'get-calculated-price-and-quantity-workflow',
	({ productId }: WorkflowInput) => {
		const products = useQueryStep({
			entity: 'product',
			fields: [
				'id',
				'metadata',
				'variants.id',
				'variants.manage_inventory',
				'variants.calculated_price.*',
			],
			filters: {
				id: productId,
			},
			context: {
				variants: {
					calculated_price: QueryContext({ currency_code: 'thb' }),
				},
			},
		}).config({ name: 'fetch-product-prices' });

		const productsWithPrices = transform(
			products,
			(data) => data.data as ProductDTO[],
		);

		const { products: productsWithQuantity } = getProductsQuantityStep({
			products: productsWithPrices,
		});

		return new WorkflowResponse({
			products: productsWithQuantity,
		});
	},
);

export default getCalculatePriceAndQuantityWorkflow;
