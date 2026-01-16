import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type ProductMeiliSearchModuleService from '../../../../modules/meilisearch/product-meilisearch/service';
import { PRODUCT_MEILISEARCH_MODULE } from '../../../../modules/meilisearch/product-meilisearch';
import type { ProductMeiliSearch } from '../index';
import type { Logger } from '@medusajs/framework/types';

const syncToMeiliSearchStep = createStep(
	'sync-to-meilisearch-step',
	async (input: { products: ProductMeiliSearch[] }, context) => {
		const logger: Logger = context.container.resolve('logger');

		const productMeiliSearchModuleService: ProductMeiliSearchModuleService =
			context.container.resolve(PRODUCT_MEILISEARCH_MODULE);
		await productMeiliSearchModuleService.bulkAddOrUpdate(input.products);

		logger.info(
			`[sync-to-meilisearch-step]: Synced ${input.products.length} products to MeiliSearch`,
		);

		return new StepResponse(
			{
				products: input.products,
			},
			{
				previousData: {},
			},
		);
	},
);

export default syncToMeiliSearchStep;
