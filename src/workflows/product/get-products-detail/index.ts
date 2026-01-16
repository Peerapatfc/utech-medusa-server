import {
	createWorkflow,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import getProductsStep from './steps/get-products-step';
import getProductsQuantityStep from './steps/get-product-quantity-step';
import sortProductsStep from './steps/sort-products-step';

export type GetProductDetailWorkflowInput = {
	productIds: string[];
	sortBy?: string;
};

const getProductDetailWorkflow = createWorkflow(
	'get-product-detail-workflow',
	(input: GetProductDetailWorkflowInput) => {
		const { products: productsWithPrice } = getProductsStep(input);
		const { products: productsWithQuantity } = getProductsQuantityStep({
			products: productsWithPrice,
		});
		const { products: sortedProducts } = sortProductsStep({
			products: productsWithQuantity,
			productIds: input.productIds,
		});

		return new WorkflowResponse(sortedProducts);
	},
);

export default getProductDetailWorkflow;
