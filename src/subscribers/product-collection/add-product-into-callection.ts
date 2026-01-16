import type {
	SubscriberArgs,
	SubscriberConfig,
} from '@medusajs/framework/subscribers';
import type { IProductModuleService } from '@medusajs/framework/types';
import { Modules, ProductEvents } from '@medusajs/framework/utils';

export default async function addProductIntoCollectionHandler({
	event: { data },
	container,
}: SubscriberArgs<{ id: string }>) {
	const logger = container.resolve('logger');
	const collectionId = data.id;

	logger.info('Collection updated...');

	const productService: IProductModuleService = container.resolve(
		Modules.PRODUCT,
	);

	const collection = await productService.retrieveProductCollection(
		collectionId,
		{
			relations: ['products'],
		},
	);

	const products = collection?.products || [];

	const sameCollectionRankProducts = products.filter(
		(product) => product.metadata?.collection_id_ranking === collectionId,
	);
	const lastestRank = sameCollectionRankProducts.reduce(
		(acc: number, product) => {
			const rank = (product.metadata?.collection_rank || 0) as number;
			return rank > acc ? rank : acc;
		},
		-1,
	);

	const newRank = sameCollectionRankProducts.length === 0 ? 0 : lastestRank + 1;
	const unrankedProducts = products.filter(
		(product) =>
			product.metadata?.collection_rank === undefined ||
			product.metadata?.collection_id_ranking !== collectionId,
	);

	let rank = newRank;
	for (const product of unrankedProducts) {
		await productService.updateProducts(product.id, {
			metadata: {
				collection_rank: rank,
				collection_id_ranking: collectionId,
			},
		});

		rank++;
	}
}

export const config: SubscriberConfig = {
	event: ProductEvents.PRODUCT_COLLECTION_UPDATED,
	context: {
		subscriberId: 'add-product-into-collection',
	},
};
