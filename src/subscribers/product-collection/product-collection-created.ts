import type { IProductModuleService } from '@medusajs/framework/types';
import {
	Modules,
	ProductCollectionWorkflowEvents,
} from '@medusajs/framework/utils';
import type {
	Logger,
	SubscriberArgs,
	SubscriberConfig,
} from '@medusajs/medusa';
import { COLLECTION_STRAPI_MODULE } from '../../modules/strapi/product-collection';
import type CollectionStrapiService from '../../modules/strapi/product-collection/service';

// subscriber function
export default async function productCollectionCreatedHandler({
	event: { data },
	container,
}: SubscriberArgs<{ id: string }>) {
	try {
		const collectionId = data.id;
		const logger: Logger = container.resolve('logger');
		const productService: IProductModuleService = container.resolve(
			Modules.PRODUCT,
		);
		const collectionStrapiModuleService: CollectionStrapiService =
			container.resolve(COLLECTION_STRAPI_MODULE);

		const collection = await productService.retrieveProductCollection(
			collectionId,
			{
				select: ['*'],
			},
		);

		const create = await collectionStrapiModuleService.createCollection({
			name: collection.title,
			handle: collection.handle,
			medusa_id: collection.id,
			metadata: collection.metadata,
		});

		if (create) {
			await productService.updateProductCollections(collection.id, {
				metadata: {
					...collection.metadata,
					strapi_id: create.id,
				},
			});
		}

		return logger.info(`The product-collection ${collectionId} was created`);
	} catch (error) {
		const logger: Logger = container.resolve('logger');
		logger.error(
			`Error creating collection in Strapi: ${error.message}`,
			error,
		);
		throw error;
	}
}

// subscriber config
export const config: SubscriberConfig = {
	event: ProductCollectionWorkflowEvents.CREATED,
	context: {
		subscriberId: 'product-collection-created-strapi',
	},
};
