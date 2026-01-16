import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import { logger } from '@medusajs/framework/logger';
import type { INotificationModuleService } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import type StoreNotificationProviderService from '../../../../modules/store-notification/service';
import { fetchUnreadCounts } from '../helpers';
import type { StoreBulkReadNotificationsBody } from '../validator';

export const POST = async (
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
) => {
	const { ids } = req.body as StoreBulkReadNotificationsBody;
	const customerId = req.auth_context?.actor_id;

	const storeNotificationsService: StoreNotificationProviderService =
		req.scope.resolve('storeNotificationModuleService');
	const notificationModuleService: INotificationModuleService =
		req.scope.resolve(Modules.NOTIFICATION);

	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
	try {
		const updatedNotifications = [];
		const failures: { id: string; error: string }[] = [];

		const notifications = await query.graph({
			entity: 'notification',
			filters: {
				id: {
					$in: ids,
				},
				channel: 'store-notification',
			},
			fields: ['id', 'to'],
		});

		const notificationIds = notifications.data.map(
			(notification) => notification.id,
		);

		const updated =
			await storeNotificationsService.bulkUpdateReadNotification(
				notificationIds,
			);

		res.status(200).json({
			success: true,
			updated_count: updated,
		});
	} catch (error) {
		logger.error('Error updating notifications:', error);
		res.status(500).json({
			message: 'An error occurred while updating notifications',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};
