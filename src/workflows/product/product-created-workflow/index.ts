import {
	createWorkflow,
	transform,
	when,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import { useQueryStep } from '../../common/steps/use-query';
import type { AdminProduct } from '@medusajs/framework/types';
import syncProductToStrapiStep from './steps/sync-product-to-strapi-step';
import { ProductStatus } from '@medusajs/framework/utils';
import updateProductSearchMetadataWorkflow from '../update-product-search-metadata';
import syncProductMeilisearchWorkflowV2 from '../sync-meilisearch-v2';

export type ProductCreatedWorkflowInput = {
	id: string;
};

export const THREE_DAYS = 60 * 60 * 24 * 3;
export const productCreatedWorkflowId = 'product-created-workflow';

const productCreatedWorkflow = createWorkflow(
	{
		name: productCreatedWorkflowId,
		store: true,
		idempotent: true,
		retentionTime: THREE_DAYS,
	},
	(input: ProductCreatedWorkflowInput) => {
		// step 1: get product
		const products = useQueryStep({
			entity: 'product',
			fields: ['*'],
			filters: { id: input.id },
			pagination: {
				skip: 0,
				take: 1,
			},
		});

		const product = transform({ products }, ({ products }) => {
			return products.data[0] as AdminProduct;
		});

		when(product, (product) => {
			return product.status === ProductStatus.PUBLISHED;
		}).then(() => {
			// step 2: sync product to meilisearch
			syncProductMeilisearchWorkflowV2.runAsStep({
				input: {
					productIds: [product.id],
				},
			});
		});

		// step 3: sync product to strapi
		syncProductToStrapiStep({
			product,
		});

		updateProductSearchMetadataWorkflow.runAsStep({
			input: {
				productId: [input.id],
			},
		});

		return new WorkflowResponse({
			product,
		});
	},
);

export default productCreatedWorkflow;
