import type { MedusaContainer } from '@medusajs/framework/types';
import {
	buildPriceListRules,
	buildPriceSetPricesForCore,
	ContainerRegistrationKeys,
	remoteQueryObjectFromString,
} from '@medusajs/framework/utils';

export const transformPriceList = (priceList) => {
	priceList.rules = buildPriceListRules(priceList.price_list_rules);
	priceList.prices = buildPriceSetPricesForCore(priceList.prices);

	priceList.price_list_rules = undefined;

	return priceList;
};

export const fetchPriceListPriceIdsForProduct = async (
	priceListId: string,
	productIds: string[],
	scope: MedusaContainer,
): Promise<string[]> => {
	const remoteQuery = scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);
	const priceSetIds: string[] = [];
	const variants = await remoteQuery(
		remoteQueryObjectFromString({
			entryPoint: 'variants',
			variables: { filters: { product_id: productIds } },
			fields: ['price_set.id'],
		}),
	);

	for (const variant of variants) {
		if (variant.price_set?.id) {
			priceSetIds.push(variant.price_set.id);
		}
	}

	const productPrices = await remoteQuery(
		remoteQueryObjectFromString({
			entryPoint: 'prices',
			variables: {
				filters: { price_set_id: priceSetIds, price_list_id: priceListId },
			},
			fields: ['id'],
		}),
	);

	return productPrices.map((price) => price.id);
};
