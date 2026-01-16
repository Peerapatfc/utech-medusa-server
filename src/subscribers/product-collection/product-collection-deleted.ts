import { ProductCollectionWorkflowEvents } from '@medusajs/framework/utils';
import type {
	Logger,
	SubscriberArgs,
	SubscriberConfig,
} from '@medusajs/medusa';
import { COLLECTION_STRAPI_MODULE } from '../../modules/strapi/product-collection';
import type CollectionStrapiService from '../../modules/strapi/product-collection/service';

// subscriber function
export default async function productCollectionDeletedHandler({
	event: { data },
	container,
}: SubscriberArgs<{ id: string }>) {
	try {
		const collectionId = data.id;
		const logger: Logger = container.resolve('logger');
		const collectionStrapiModuleService: CollectionStrapiService =
			container.resolve(COLLECTION_STRAPI_MODULE);

		const existingCollection =
			await collectionStrapiModuleService.getCollectionByMedusaId(collectionId);

		if (existingCollection) {
			await collectionStrapiModuleService.deleteCollectionByMedusaId(
				collectionId,
			);
			logger.info(`Collection ${collectionId} deleted from Strapi`);
		} else {
			logger.warn(`Collection ${collectionId} not found in Strapi`);
		}

		return logger.info(`The product-collection ${collectionId} was deleted`);
	} catch (error) {
		const logger: Logger = container.resolve('logger');
		logger.error(
			`Error deleting collection from Strapi: ${error.message}`,
			error,
		);
		throw error;
	}
}

// subscriber config
export const config: SubscriberConfig = {
	event: ProductCollectionWorkflowEvents.DELETED,
	context: {
		subscriberId: 'product-collection-deleted-strapi',
	},
};
