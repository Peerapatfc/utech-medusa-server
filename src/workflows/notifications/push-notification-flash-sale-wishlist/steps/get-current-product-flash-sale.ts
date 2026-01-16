import type { PriceListCustomDTO } from '@customTypes/price-list-custom';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';

const getCurrentProductFlashSaleStep = createStep(
	'get-current-product-flash-sale',
	async (_, { container }) => {
		const query = container.resolve(ContainerRegistrationKeys.QUERY);

		const { data: flashSalePriceLists } = (await query.graph({
			entity: 'price_list',
			fields: ['*', 'price_list_custom.*'],
			filters: {
				status: 'active',
				starts_at: { $lte: new Date() },
				ends_at: { $gte: new Date() },
			},
		})) as unknown as { data: PriceListCustomDTO[] };

		const currentProductFlashSales = flashSalePriceLists.filter(
			(pl) =>
				pl.price_list_custom?.is_flash_sale &&
				!pl.price_list_custom.is_notification_sent,
		);

		return new StepResponse({ currentProductFlashSales });
	},
);

export default getCurrentProductFlashSaleStep;
