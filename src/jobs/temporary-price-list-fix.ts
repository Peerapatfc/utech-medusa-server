import { MedusaContainer } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

/**
 * 🚧 Workaround for Medusa bug in v2.9.0
 *
 * Issue: "Expired price list falls back to original price instead of cheapest active price list"
 * Ref: https://github.com/medusajs/medusa/issues/13310
 *
 * Ensures product prices fall back to the cheapest active price list
 * instead of reverting to the original price.
 *
 * TODO: Remove once the upstream fix is released.
 */
export default async function temporaryPriceListFix(
	container: MedusaContainer,
) {
	const logger = container.resolve('logger');
	// logger.info('Running temporary fix for expired price lists...');

	// const priceService = container.resolve(Modules.PRICING);
	// const expiredPriceList = await priceService.listPriceLists(
	// 	{
	// 		ends_at: {
	// 			$lt: new Date().toISOString(),
	// 		},
	// 	},
	// 	{
	// 		relations: ['prices'],
	// 		take: 2000,
	// 		skip: 0,
	// 		order: {
	// 			ends_at: 'DESC',
	// 		},
	// 	},
	// );

	// const priceIdsToDelete = [];
	// // soft delete all prices
	// for await (const priceList of expiredPriceList) {
	// 	const priceIds = priceList.prices.map((price) => price.id);
	// 	priceIdsToDelete.push(...priceIds);
	// }

	// if (priceIdsToDelete.length > 0) {
	// 	await priceService.softDeletePrices(priceIdsToDelete);
	// 	logger.info(`Soft deleted prices: ${priceIdsToDelete.join(', ')}`);
	// }
}

export const config = {
	name: 'temporary-price-list-fix',
	schedule: '* * * * *',
};
