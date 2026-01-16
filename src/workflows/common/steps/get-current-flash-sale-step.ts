import type { Logger, PriceListDTO } from '@medusajs/framework/types';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';

const getCurrentFlashSaleStep = createStep(
	'get-current-flash-sale-step',
	async (_, { container }) => {
		const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);
		const query = container.resolve(ContainerRegistrationKeys.QUERY);

		const { data: flashSalePriceLists } = (await query.graph({
			entity: 'price_list',
			fields: [
				'*',
				'prices.*',
				'prices.price_set.*',
				'prices.price_set.variant.*',
				'price_list_custom.*',
				'price_list_custom.price_list_variants.*',
			],
			filters: {
				status: 'active',
				starts_at: { $lte: new Date() },
				ends_at: { $gte: new Date() },
			},
		})) as unknown as { data: PriceListDTO[] };

		const currentFlashSalePriceList = flashSalePriceLists.find(
			//@ts-ignore
			(pl) => pl.price_list_custom?.is_flash_sale,
		);

		if (!currentFlashSalePriceList) {
			logger.info(
				'[get-current-flash-sale-step]: No any current flash sale found',
			);
			return new StepResponse(null);
		}

		logger.info(
			`[get-current-flash-sale-step]: Current flash sale found: ${currentFlashSalePriceList.id}`,
		);
		return new StepResponse(currentFlashSalePriceList);
	},
);

export default getCurrentFlashSaleStep;
