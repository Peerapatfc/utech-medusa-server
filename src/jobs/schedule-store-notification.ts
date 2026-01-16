import type { Logger, MedusaContainer } from '@medusajs/framework/types';
import { STORE_NOTIFICATION_MODULE } from '../modules/store-notification';
import type StoreNotificationProviderService from '../modules/store-notification/service';
import {
	StoreNotificationBroadcastType,
	StoreNotificationStatus,
} from '../types/store-notification';
import pushNotificationWorkflow from '../workflows/store-notification/push-notification-workflow';

export default async function scheduleStoreNotification(
	container: MedusaContainer,
) {
	// if (process.env.NODE_ENV === "development") {
	// 	return;
	// }

	const logger: Logger = container.resolve('logger');
	logger.info('Schedule store notification worker is starting...');

	// get store-notification status = schedule && broadcast_type = schedule && scheduled_at < now
	const storeNotificationService: StoreNotificationProviderService =
		container.resolve(STORE_NOTIFICATION_MODULE);

	const scheduledNotifications =
		await storeNotificationService.listStoreNotificationModels({
			status: StoreNotificationStatus.SCHEDULED,
			broadcast_type: StoreNotificationBroadcastType.SCHEDULED,
			scheduled_at: { $lte: new Date() },
		});

	logger.info(
		`Found ${scheduledNotifications.length} scheduled notifications to process`,
	);

	const workflow = pushNotificationWorkflow(container);

	// Process each scheduled notification
	for (const notification of scheduledNotifications) {
		try {
			// Execute the workflow directly
			await workflow.run({
				input: {
					id: notification.id,
				},
			});
			logger.info(`Processed scheduled notification: ${notification.id}`);
		} catch (error) {
			logger.error(
				`Failed to process scheduled notification ${notification.id}: ${error.message}`,
			);
		}
	}
}

export const config = {
	name: 'schedule-store-notification',
	schedule: '* * * * *',
};
