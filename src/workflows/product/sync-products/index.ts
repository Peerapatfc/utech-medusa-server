import {
	createWorkflow,
	WorkflowResponse,
	transform,
} from '@medusajs/framework/workflows-sdk';
import { useQueryGraphStep } from '@medusajs/medusa/core-flows';
import syncProductMeilisearchWorkflowV2 from '../sync-meilisearch-v2';
import { fetchMeiliProductsStep } from './steps/fetch-meili-products-step';
import { removeUnpublishedStep } from './steps/remove-unpublished-step';

export const syncProductsWorkflow = createWorkflow(
	'sync-products-workflow',
	(_) => {
		syncProductMeilisearchWorkflowV2.runAsStep({
			input: {
				syncAll: true,
			},
		});

		const { data: publishedProducts } = useQueryGraphStep({
			entity: 'product',
			fields: ['id'],
			filters: { status: 'published' },
		}).config({ name: 'fetch-products' });

		const publishedProductIds = transform(publishedProducts, (products) =>
			products.map((p) => p.id),
		);

		const meiliProductIds = fetchMeiliProductsStep();

		const toRemoveProductIds = transform(
			{ publishedProductIds, meiliProductIds },
			({ publishedProductIds, meiliProductIds }) =>
				meiliProductIds.filter((id) => !publishedProductIds.includes(id)),
		);

		removeUnpublishedStep({
			ids: toRemoveProductIds,
		});

		return new WorkflowResponse({
			message: 'Sync products workflow completed',
			removed: toRemoveProductIds?.length || 0,
		});
	},
);
