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
export default async function productCollectionUpdatedHandler({
	event: { data },
	container,
}: SubscriberArgs<{ id: string }>) {
	const logger: Logger = container.resolve('logger');

	try {
		const collectionId = data.id;
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

		const existingCollection =
			await collectionStrapiModuleService.getCollectionByMedusaId(
				collection.id,
			);
		let strapi_id = null;

		if (existingCollection) {
			const updated = await collectionStrapiModuleService.updateCollection(
				existingCollection.id,
				{
					name: collection.title,
					handle: collection.handle,
					medusa_id: collection.id,
					metadata: collection.metadata,
				},
			);
			strapi_id = updated.id;
		} else {
			const created = await collectionStrapiModuleService.createCollection({
				name: collection.title,
				handle: collection.handle,
				medusa_id: collection.id,
				metadata: collection.metadata,
			});
			strapi_id = created.id;
		}

		if (strapi_id) {
			await productService.updateProductCollections(collection.id, {
				metadata: {
					...collection.metadata,
					strapi_id: strapi_id,
				},
			});
		}

		logger.info(`The product-collection ${collectionId} was updated`);
	} catch (error) {
		logger.error(
			`Error updating collection in Strapi: ${error.message}`,
			error,
		);
	}
}

// subscriber config
export const config: SubscriberConfig = {
	event: ProductCollectionWorkflowEvents.UPDATED,
	context: {
		subscriberId: 'product-collection-updated-strapi',
	},
};
