import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { STORE_NOTIFICATION_MODULE } from 'src/modules/store-notification';
import type StoreNotificationProviderService from '../../../../modules/store-notification/service';

export const PUT = async (
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
) => {
	const customerId = req.auth_context?.actor_id;

	const storeNotificationsService: StoreNotificationProviderService =
		req.scope.resolve(STORE_NOTIFICATION_MODULE);
	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

	const { data: notificationsResult } = await query.graph({
		entity: 'notification',
		fields: ['id', 'to'],
		filters: {
			channel: 'store-notification',
			to: customerId,
			//@ts-ignore
			$or: [
				{
					data: {
						is_read: false,
					},
				},
				{
					$not: {
						data: {
							$hasKey: 'is_read',
						},
					},
				},
			],
		},
	});

	if (notificationsResult.length === 0) {
		res.json({
			updated: 0,
		});
		return;
	}

	const notificationIds = notificationsResult.map(
		(notification) => notification.id,
	);

	const updated =
		await storeNotificationsService.bulkUpdateReadNotification(notificationIds);
	res.json({
		updated,
	});
};
