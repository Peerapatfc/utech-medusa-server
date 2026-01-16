import {
	createWorkflow,
	transform,
	when,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import { useQueryStep } from '../../common/steps/use-query';
import type { ProductDTO } from '@medusajs/framework/types';
import syncProductUpdatedToStrapiStep from './steps/sync-product-updated-to-strapi-step';
import { ProductStatus } from '@medusajs/framework/utils';
import syncProductMeilisearchWorkflowV2 from '../sync-meilisearch-v2';

export type ProductCreatedWorkflowInput = {
	id: string;
};

export const THREE_DAYS = 60 * 60 * 24 * 3;
export const productUpdatedWorkflowId = 'product-updated-workflow';

const productUpdatedWorkflow = createWorkflow(
	{
		name: productUpdatedWorkflowId,
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
			return products.data[0] as ProductDTO;
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

		when(product, (product) => {
			return product.status !== ProductStatus.PUBLISHED;
		}).then(() => {
			// step 2: delete product in meilisearch
		});

		// step 3: sync product to strapi
		syncProductUpdatedToStrapiStep({
			product,
		});

		return new WorkflowResponse({
			product,
		});
	},
);

export default productUpdatedWorkflow;
