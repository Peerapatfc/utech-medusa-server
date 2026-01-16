import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import type { Logger } from '@medusajs/framework/types';
import { ContainerRegistrationKeys } from '@medusajs/utils';
import type { NotificationData } from '../../../types/store-notification';
import { StoreNotificationCategory } from '../../../types/store-notification';
import {
	countNotificationByCategory,
	createCategoryFilters,
	formatNotifications,
} from './helpers';
import type { StoreGetNotificationsParams } from './validator';

export const GET = async (
	req: AuthenticatedMedusaRequest<StoreGetNotificationsParams>,
	res: MedusaResponse,
) => {
	const logger: Logger = req.scope.resolve('logger');

	try {
		const customerId = req.auth_context?.actor_id;
		const limit = req.validatedQuery.limit as number;
		const offset = req.validatedQuery.offset as number;
		const categoryParam = req.validatedQuery.category as string;

		const categoryFilters = createCategoryFilters(categoryParam);
		const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
		const { data: notificationsResult, metadata } = await query.graph({
			entity: 'notification',
			fields: req.queryConfig.fields,
			filters: {
				channel: 'store-notification',
				to: customerId,
				...categoryFilters,
			},
			pagination: {
				skip: offset,
				take: limit,
				order: {
					created_at: 'DESC',
				},
			},
		});

		const notificationsData = Array.isArray(notificationsResult)
			? notificationsResult
			: [];

		const notifications = formatNotifications(notificationsData);

		const notificationCountByCategory = await countNotificationByCategory(
			req.scope,
			customerId,
		);

		res.status(200).json({
			notifications,
			count: notificationCountByCategory,
			limit,
			offset,
		});
	} catch (error) {
		logger.error('Error retrieving notifications:', error);
		res.status(500).json({
			message: 'An error occurred while retrieving notifications',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};
