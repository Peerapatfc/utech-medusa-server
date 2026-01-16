import {
	WorkflowResponse,
	createWorkflow,
} from '@medusajs/framework/workflows-sdk';
import { fetchInitialProductDataStep } from '../../dashboard/data-insight/steps/fetch-initial-product-data';
import { fetchAllOrdersStep } from '../../dashboard/data-insight/steps/fetch-all-orders';
import { getMostPurchasedProductsStep } from '../../dashboard/data-insight/steps/get-most-purchased-products';

export type ProductBestSellersInput = {
	product_ids: string[];
	limit: number;
};

export const ProductBestSellersWorkflow = createWorkflow(
	'best-sellers-workflow',
	(input: ProductBestSellersInput) => {
		const { product_ids, limit } = input;

		// Fetch initial data for all product IDs
		const initialProductData = fetchInitialProductDataStep({ product_ids });
		const allOrders = fetchAllOrdersStep({});

		// Get insights
		const mostPurchasedProducts = getMostPurchasedProductsStep({
			products: initialProductData,
			allOrders,
			limit,
		});

		// The workflow returns a structured response containing all gathered insights.
		return new WorkflowResponse({
			success: true,
			products: mostPurchasedProducts,
		});
	},
);
