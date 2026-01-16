import {
	createWorkflow,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import getProductsStep from './steps/get-products-step';
import buildProductsStep from './steps/build-products-step';
import syncToMeiliSearchStep from './steps/sync-to-meilisearch-step';
import type { ProductDTO } from '@medusajs/framework/types';

export type SyncProductMeiliSearchWorkflowInput = {
	productIds: string[];
};

export interface ProductMeiliSearch extends Omit<ProductDTO, 'categories'> {
	sku: string;
	variant_sku: string[];
	variant_title: string[];
	synced_at: string;
	wishlist_count: number;
}

/**
 * @deprecated
 * This workflow is deprecated and will be removed in future versions.
 * Please use the new `syncProductMeilisearchWorkflowV2` workflow instead.
 */
const syncProductToMeiliSearchWorkflow = createWorkflow(
	'sync-product-to-meilisearch-workflow',
	(input: SyncProductMeiliSearchWorkflowInput) => {
		const { products: productList } = getProductsStep(input);
		const { products } = buildProductsStep({ products: productList });
		syncToMeiliSearchStep({ products });

		return new WorkflowResponse(products);
	},
);

export default syncProductToMeiliSearchWorkflow;
