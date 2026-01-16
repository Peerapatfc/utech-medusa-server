import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import { STORE_NOTIFICATION_MODULE } from '../../../../modules/store-notification';
import type StoreNotificationProviderService from '../../../../modules/store-notification/service';
import type { StoreNotification } from '../../../../types/store-notification';

type StepInput = {
	id: string;
};

async function handler(input: StepInput, { container }) {
	const { id } = input;

	const storeNotificationsService: StoreNotificationProviderService =
		container.resolve(STORE_NOTIFICATION_MODULE);

	const storeNotification =
		await storeNotificationsService.retrieveStoreNotificationModel(id);

	if (!storeNotification) {
		throw new Error(`Store notification with ID ${id} not found`);
	}

	return new StepResponse({ storeNotification });
}

export const getStoreNotification = createStep(
	'get-store-notification',
	handler,
);
