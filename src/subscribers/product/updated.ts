import type { SubscriberConfig } from '@medusajs/framework';
import type { IProductModuleService, Logger } from '@medusajs/framework/types';
import { Modules, ProductEvents } from '@medusajs/framework/utils';
import productUpdatedWorkflow from '../../workflows/product/product-updated-workflow';
import type ProductMeiliSearchModuleService from '../../modules/meilisearch/product-meilisearch/service';
import { PRODUCT_MEILISEARCH_MODULE } from '../../modules/meilisearch/product-meilisearch';

export default async function productUpdatedHandler({ event, container }) {
	const logger: Logger = container.resolve('logger');
	const productId = event.data.id;
	logger.info(
		`Product updated event [ProductEvents.PRODUCT_UPDATED], product: ${productId}`,
	);
	const productMeiliSearchModuleService: ProductMeiliSearchModuleService =
		container.resolve(PRODUCT_MEILISEARCH_MODULE);
	const productModuleService: IProductModuleService = container.resolve(
		Modules.PRODUCT,
	);
	const product = await productModuleService.retrieveProduct(productId, {
		relations: ['type'],
	});
	const isServiceType = product.type?.value === 'Service';

	const isUnpublished = product.status !== 'published';
	if (isServiceType || isUnpublished) {
		await productMeiliSearchModuleService.delete(productId);
		return;
	}

	await productUpdatedWorkflow(container).run({
		input: {
			id: productId,
		},
	});
}

export const config: SubscriberConfig = {
	event: ProductEvents.PRODUCT_UPDATED,
};
