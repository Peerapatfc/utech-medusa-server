import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import type PriceListCustomModuleService from '../../../../modules/price-list-custom/service';
import { PRICE_LIST_CUSTOM_MODULE } from '../../../../modules/price-list-custom';
import type { PriceListCustomDTO } from '@customTypes/price-list-custom';

type StepInput = {
	currentProductFlashSales: PriceListCustomDTO[];
};

async function handler(input: StepInput, { container }) {
	const { currentProductFlashSales } = input;

	const priceListCustomModuleService: PriceListCustomModuleService =
		container.resolve(PRICE_LIST_CUSTOM_MODULE);

	try {
		for await (const currentProductFlashSale of currentProductFlashSales) {
			priceListCustomModuleService.updatePriceListCustoms({
				id: currentProductFlashSale.price_list_custom.id,
				is_notification_sent: true,
			});
		}

		if (currentProductFlashSales.length === 0) {
			return new StepResponse({
				updated: false,
				message:
					'No notifications flash sale were sent, not have update status',
			});
		}

		return new StepResponse({
			updated: true,
			message: 'Successfully updated flash sale notification status to sent',
		});
	} catch (error) {
		throw new Error(`Failed to update notification status: ${error.message}`);
	}
}

export const updateSentStatus = createStep(
	{
		name: 'update-flash-sale-notification-sent-status',
	},
	handler,
);
