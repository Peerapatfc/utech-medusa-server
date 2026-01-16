import {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework';
import StoreNotificationProviderService from '../../../../modules/store-notification/service';
import { STORE_NOTIFICATION_MODULE } from '../../../../modules/store-notification';
import {
	ContainerRegistrationKeys,
	MedusaError,
} from '@medusajs/framework/utils';

export const DELETE = async (
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
) => {
	const customerId = req.auth_context.actor_id;
	const storeNotificationsService: StoreNotificationProviderService =
		req.scope.resolve(STORE_NOTIFICATION_MODULE);
	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

	try {
		const notifications = await query.graph({
			entity: 'notification',
			filters: {
				to: customerId,
				channel: 'store-notification',
			},
			fields: ['id', 'to', 'channel'],
		});

		const notificationIds = notifications.data.map(
			(notification) => notification.id,
		);

		const deleted =
			await storeNotificationsService.bulkDeleteNotification(notificationIds);

		res.json({
			deleted,
		});
	} catch (error) {
		throw new MedusaError(
			MedusaError.Types.UNEXPECTED_STATE,
			`Failed to delete notifications: ${error.message}`,
		);
	}
};
