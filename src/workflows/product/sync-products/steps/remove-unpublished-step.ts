import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { PRODUCT_MEILISEARCH_MODULE } from '../../../../modules/meilisearch/product-meilisearch';
import ProductMeiliSearchModuleService from '../../../../modules/meilisearch/product-meilisearch/service';

export const removeUnpublishedStep = createStep(
	'remove-unpublished-step',
	async ({ ids }: { ids: string[] }, { container }) => {
		const productMeiliSearchModuleService: ProductMeiliSearchModuleService =
			container.resolve(PRODUCT_MEILISEARCH_MODULE);

		if (ids?.length === 0) {
			return new StepResponse('No products to remove');
		}

		await productMeiliSearchModuleService.deleteDocuments(ids);
		return new StepResponse(`Removed ${ids.length} products from MeiliSearch`);
	},
);
