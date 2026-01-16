import type {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import type {
	ICustomerModuleService,
	IUserModuleService,
	UserDTO,
} from '@medusajs/framework/types';
import type { CustomerDTO, CustomerGroupDTO } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { STORE_NOTIFICATION_MODULE } from '../../../../modules/store-notification';
import type StoreNotificationProviderService from '../../../../modules/store-notification/service';
import type { StoreNotification } from '../../../../types/store-notification';
import {
	StoreNotificationBroadcastType,
	StoreNotificationRecipientType,
} from '../../../../types/store-notification';

// Extended StoreNotification type with customer data
interface EnrichedStoreNotification extends StoreNotification {
	customers?: CustomerDTO[];
	customer_groups?: CustomerGroupDTO[];
	created_by_user?: UserDTO[];
	updated_by_user?: UserDTO[];
}

/**
 * Get a store notification by ID
 */
export async function GET(
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	try {
		const { id } = req.params;
		const storeNotificationsService: StoreNotificationProviderService =
			req.scope.resolve(STORE_NOTIFICATION_MODULE);
		const customerService: ICustomerModuleService = req.scope.resolve(
			Modules.CUSTOMER,
		);

		const storeNotification =
			await storeNotificationsService.retrieveStoreNotificationModel(id);

		if (!storeNotification) {
			res.status(404).json({ message: 'Store notification not found' });
			return;
		}

		// Cast to enriched type to add customer data
		const enrichedNotification = storeNotification as EnrichedStoreNotification;

		// Add customer data if customer_ids exist
		if (
			enrichedNotification.customer_ids &&
			Array.isArray(enrichedNotification.customer_ids)
		) {
			const [customers] = await customerService.listAndCountCustomers(
				{
					id: enrichedNotification.customer_ids,
				},
				{ select: ['id', 'email', 'first_name', 'last_name', 'has_account'] },
			);

			enrichedNotification.customers = customers;
		}

		// Add customer group data if customer_group_ids exist
		if (
			enrichedNotification.customer_group_ids &&
			Array.isArray(enrichedNotification.customer_group_ids)
		) {
			const [customerGroups] = await customerService.listAndCountCustomerGroups(
				{
					id: enrichedNotification.customer_group_ids,
				},
				{
					select: ['id', 'name'],
				},
			);
			enrichedNotification.customer_groups = customerGroups;
		}

		if (enrichedNotification.created_by) {
			const userService: IUserModuleService = req.scope.resolve(Modules.USER);
			const users = await userService.listUsers(
				{ id: enrichedNotification.created_by },
				{ select: ['id', 'email', 'first_name', 'last_name'] },
			);
			enrichedNotification.created_by_user = users;
		}

		if (enrichedNotification.updated_by) {
			const userService: IUserModuleService = req.scope.resolve(Modules.USER);
			const users = await userService.listUsers(
				{ id: enrichedNotification.updated_by },
				{ select: ['id', 'email', 'first_name', 'last_name'] },
			);
			enrichedNotification.updated_by_user = users;
		}

		res.status(200).json(enrichedNotification);
	} catch (error) {
		res.status(500).json({
			message: 'Failed to fetch store notification',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
}

/**
 * Update a store notification by ID
 */
export async function PUT(
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	try {
		const { id } = req.params;
		const updateData = req.body as Partial<StoreNotification>;
		const storeNotificationsService: StoreNotificationProviderService =
			req.scope.resolve(STORE_NOTIFICATION_MODULE);

		// Check if notification exists
		const existing =
			await storeNotificationsService.retrieveStoreNotificationModel(id);
		if (!existing) {
			res.status(404).json({ message: 'Store notification not found' });
			return;
		}

		// Validation checks
		if (!updateData.subject_line) {
			res.status(400).json({ message: 'Subject line cannot be empty' });
			return;
		}

		updateData.updated_by = req.auth_context.actor_id;

		// Validate recipient_type requirements
		const recipientValidationErrors = {
			[StoreNotificationRecipientType.SPECIFIC]:
				!updateData.customer_ids?.length &&
				'Customer IDs are required when recipient type is specific customers',
			[StoreNotificationRecipientType.TARGETING]:
				!updateData.customer_group_ids?.length &&
				'Customer group IDs are required when recipient type is targeting',
		};

		const recipientError =
			updateData.recipient_type &&
			recipientValidationErrors[updateData.recipient_type];

		if (recipientError) {
			res.status(400).json({ message: recipientError });
			return;
		}

		// Validate broadcast_type requirements
		if (
			updateData.broadcast_type === StoreNotificationBroadcastType.SCHEDULED &&
			!updateData.scheduled_at
		) {
			res.status(400).json({
				message: 'Scheduled date is required when broadcast type is scheduled',
			});
			return;
		}

		const formattedData = {
			...updateData,
			customer_ids: updateData.customer_ids ?? undefined,
			customer_group_ids: updateData.customer_group_ids ?? undefined,
		};

		// Remove undefined values to prevent nullifying existing fields
		const cleanedData = Object.fromEntries(
			Object.entries(formattedData).filter(([_, v]) => v !== undefined),
		);

		// Update and return result
		const updatedNotification =
			await storeNotificationsService.updateStoreNotificationModels({
				...cleanedData,
				id,
			});

		res.status(200).json(updatedNotification);
	} catch (error) {
		res.status(500).json({
			message: 'Failed to update store notification',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
}

/**
 * Delete a store notification by ID
 */
export async function DELETE(
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	try {
		const { id } = req.params;
		const storeNotificationsService: StoreNotificationProviderService =
			req.scope.resolve(STORE_NOTIFICATION_MODULE);

		const existing =
			await storeNotificationsService.retrieveStoreNotificationModel(id);
		if (!existing) {
			res.status(404).json({ message: 'Store notification not found' });
			return;
		}

		// Delete notification using the ID
		await storeNotificationsService.softDeleteStoreNotificationModels({ id });

		res.status(204).end();
	} catch (error) {
		res.status(500).json({
			message: 'Failed to delete store notification',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
}
