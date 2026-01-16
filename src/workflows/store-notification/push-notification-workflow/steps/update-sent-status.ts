import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import { STORE_NOTIFICATION_MODULE } from '../../../../modules/store-notification';
import type StoreNotificationProviderService from '../../../../modules/store-notification/service';
import type { StoreNotification } from '../../../../types/store-notification';
import {
	StoreNotificationBroadcastType,
	StoreNotificationStatus,
} from '../../../../types/store-notification';

type StepInput = {
	storeNotification: StoreNotification;
	sent: number;
	success: boolean;
};

async function handler(input: StepInput, { container }) {
	const { storeNotification, sent, success } = input;

	const storeNotificationsService: StoreNotificationProviderService =
		container.resolve(STORE_NOTIFICATION_MODULE);

	if (!success || sent === 0) {
		throw new Error(
			'No notifications were sent successfully, cannot update status',
		);
	}

	try {
		// Update notification status to sent and broadcast type to now
		const updated =
			await storeNotificationsService.updateStoreNotificationModels({
				id: storeNotification.id,
				status: StoreNotificationStatus.SENT,
			});

		return new StepResponse({
			updated: true,
			message: 'Successfully updated notification status to sent',
			notification: updated,
		});
	} catch (error) {
		throw new Error(`Failed to update notification status: ${error.message}`);
	}
}

export const updateSentStatus = createStep('update-sent-status', handler);
