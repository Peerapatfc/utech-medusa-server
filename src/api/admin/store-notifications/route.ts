import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import type { ICustomerModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import {
	ContainerRegistrationKeys,
	remoteQueryObjectFromString,
} from '@medusajs/framework/utils';
import { STORE_NOTIFICATION_MODULE } from '../../../modules/store-notification';
import type StoreNotificationProviderService from '../../../modules/store-notification/service';
import {
	StoreNotificationBroadcastType,
	StoreNotificationRecipientType,
	StoreNotificationStatus,
} from '../../../types/store-notification';
import type { StoreNotification } from '../../../types/store-notification';
import pushNotificationWorkflow from '../../../workflows/store-notification/push-notification-workflow';
import {
	type NotificationWithRecipients,
	collectRecipientIds,
	enrichNotification,
	fetchCustomerGroups,
	fetchCustomers,
} from './helpers';
import type { AdminGetStoreNotificationsParamsType } from './validators';

/**
 * Get all store notifications
 */
export async function GET(
	req: AuthenticatedMedusaRequest<AdminGetStoreNotificationsParamsType>,
	res: MedusaResponse,
): Promise<void> {
	const remoteQuery = req.scope.resolve(ContainerRegistrationKeys.REMOTE_QUERY);
	const customerService: ICustomerModuleService = req.scope.resolve(
		Modules.CUSTOMER,
	);

	const query = remoteQueryObjectFromString({
		entryPoint: 'store_notification',
		variables: {
			filters: req.filterableFields,
			...req.queryConfig.pagination,
		},
		fields: req.queryConfig.fields,
	});

	const { rows: store_notifications, metadata } = await remoteQuery(query);
	const enrichedData = store_notifications as NotificationWithRecipients[];

	// Filter notifications that have recipients
	const notificationsToProcess = enrichedData.filter(
		(notification) =>
			notification.customer_ids?.length > 0 ||
			notification.customer_group_ids?.length > 0,
	);

	if (notificationsToProcess.length > 0) {
		const { customerIds, customerGroupIds } = collectRecipientIds(
			notificationsToProcess,
		);

		const [customersMap, customerGroupsMap] = await Promise.all([
			fetchCustomers(customerService, customerIds),
			fetchCustomerGroups(customerService, customerGroupIds),
		]);

		// Enrich notifications with customer and group data
		enrichedData.forEach((notification, index) => {
			if (notificationsToProcess.includes(notification)) {
				enrichedData[index] = enrichNotification(
					notification,
					customersMap,
					customerGroupsMap,
				);
			}
		});
	}

	res.json({
		store_notifications: enrichedData,
		count: metadata.count,
		offset: metadata.skip,
		limit: metadata.take,
	});
}

/**
 * Create a new store notification
 */
export async function POST(
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	try {
		const storeNotificationsService: StoreNotificationProviderService =
			req.scope.resolve(STORE_NOTIFICATION_MODULE);

		// Get request body
		const reqBody = req.body as StoreNotification;

		// Validate required fields
		if (!reqBody.subject_line) {
			res.status(400).json({ message: 'Subject line is required' });
			return;
		}

		reqBody.created_by = req.auth_context.actor_id;

		// Conditional validation based on recipient_type
		if (
			reqBody.recipient_type === StoreNotificationRecipientType.SPECIFIC &&
			(!reqBody.customer_ids ||
				(Array.isArray(reqBody.customer_ids) && !reqBody.customer_ids.length))
		) {
			res.status(400).json({
				message:
					'Customer IDs are required when recipient type is specific customers',
			});
			return;
		}

		if (
			reqBody.recipient_type === StoreNotificationRecipientType.TARGETING &&
			(!reqBody.customer_group_ids ||
				(Array.isArray(reqBody.customer_group_ids) &&
					!reqBody.customer_group_ids.length))
		) {
			res.status(400).json({
				message:
					'Customer group IDs are required when recipient type is targeting',
			});
			return;
		}

		// Conditional validation based on broadcast_type
		if (
			reqBody.broadcast_type === StoreNotificationBroadcastType.SCHEDULED &&
			!reqBody.scheduled_at
		) {
			res.status(400).json({
				message: 'Scheduled date is required when broadcast type is scheduled',
			});
			return;
		}

		const notificationData = {
			...reqBody,
			customer_ids: Array.isArray(reqBody.customer_ids)
				? reqBody.customer_ids
				: reqBody.customer_ids
					? [reqBody.customer_ids]
					: undefined,
			customer_group_ids: Array.isArray(reqBody.customer_group_ids)
				? reqBody.customer_group_ids
				: reqBody.customer_group_ids
					? [reqBody.customer_group_ids]
					: undefined,
		};

		const storeNotification =
			await storeNotificationsService.createStoreNotificationModels(
				notificationData,
			);

		//if broadcast_type = now call the workflow pushNotificationWorkflow

		if (
			storeNotification.broadcast_type === StoreNotificationBroadcastType.NOW &&
			storeNotification.status === StoreNotificationStatus.SENT
		) {
			await pushNotificationWorkflow(req.scope).run({
				input: { id: storeNotification.id },
			});
		}

		res.status(201).json(storeNotification);
	} catch (error) {
		res.status(500).json({
			message: 'Failed to create store notification',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
}
