import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { PRODUCT_MEILISEARCH_MODULE } from '../../../../modules/meilisearch/product-meilisearch';
import ProductMeiliSearchModuleService from '../../../../modules/meilisearch/product-meilisearch/service';

export const fetchMeiliProductsStep = createStep(
	'fetch-meilisearch-products-step',
	async (_, { container }) => {
		const productMeiliSearchModuleService: ProductMeiliSearchModuleService =
			container.resolve(PRODUCT_MEILISEARCH_MODULE);

		const meiliProducts =
			await productMeiliSearchModuleService.getAllProductIds();
		const meiliProductIds = meiliProducts.map((p) => p.id);

		return new StepResponse(meiliProductIds);
	},
);
