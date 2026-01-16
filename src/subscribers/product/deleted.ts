import type { SubscriberConfig } from '@medusajs/framework';
import type { Logger } from '@medusajs/framework/types';
import { ProductEvents } from '@medusajs/framework/utils';
import type ProductMeiliSearchModuleService from '../../modules/meilisearch/product-meilisearch/service';
import { PRODUCT_MEILISEARCH_MODULE } from '../../modules/meilisearch/product-meilisearch';

export default async function productDeletedHandler({ event, container }) {
	const logger: Logger = container.resolve('logger');
	const productId = event.data.id;

	logger.info(
		`Product deleted event [ProductEvents.PRODUCT_DELETED], product: ${productId}`,
	);
	if (!productId) {
		logger.warn('Product ID is missing in the delete event');
		return;
	}

	const productMeiliSearchModuleService: ProductMeiliSearchModuleService =
		container.resolve(PRODUCT_MEILISEARCH_MODULE);

	await productMeiliSearchModuleService.delete(productId);
}

export const config: SubscriberConfig = {
	event: ProductEvents.PRODUCT_DELETED,
};
