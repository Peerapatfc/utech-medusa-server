import type {
	SubscriberArgs,
	SubscriberConfig,
} from '@medusajs/framework/subscribers';
import type { IProductModuleService } from '@medusajs/framework/types';
import {
	Modules,
	ProductCollectionWorkflowEvents,
} from '@medusajs/framework/utils';

export default async function collectionCreatedHandler({
	event: { data },
	container,
}: SubscriberArgs<{ id: string }>) {
	const logger = container.resolve('logger');
	const collectionId = data.id;

	logger.info('Collection created...');

	const productService: IProductModuleService = container.resolve(
		Modules.PRODUCT,
	);
	const collections = (await productService.listProductCollections({}))
		.filter(
			(collection) =>
				collection.id !== collectionId &&
				(collection.metadata?.rank === 0 || collection.metadata?.rank),
		)
		.sort(
			(a, b) =>
				((b.metadata?.rank as number) || 0) -
				((a.metadata?.rank as number) || 0),
		);

	const newRank =
		collections.length > 0 ? (collections[0].metadata?.rank as number) + 1 : 0;

	await productService.updateProductCollections(collectionId, {
		metadata: {
			rank: newRank,
			is_store_visible: false,
		},
	});
}

export const config: SubscriberConfig = {
	event: ProductCollectionWorkflowEvents.CREATED,
	context: {
		subscriberId: 'collection-created-to-add-ranking',
	},
};
