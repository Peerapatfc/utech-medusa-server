import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type ProductMeiliSearchModuleService from '../../../../modules/meilisearch/product-meilisearch/service';
import { PRODUCT_MEILISEARCH_MODULE } from '../../../../modules/meilisearch/product-meilisearch';

const deleteProductInMeilisearchStep = createStep(
	'delete-product-in-meilisearch-step',
	async (input: { id: string }, { container }) => {
		const productMeiliSearchModuleService: ProductMeiliSearchModuleService =
			container.resolve(PRODUCT_MEILISEARCH_MODULE);
		await productMeiliSearchModuleService.delete(input.id);

		return new StepResponse(input);
	},
);

export default deleteProductInMeilisearchStep;
