import type {
	CreateNotificationDTO,
	ICustomerModuleService,
	MedusaContainer,
} from '@medusajs/framework/types';
import {
	StepExecutionContext,
	StepResponse,
	createStep,
} from '@medusajs/framework/workflows-sdk';
import { Modules } from '@medusajs/utils';
import { STORE_NOTIFICATION_MODULE } from '../../../../modules/store-notification';
import type StoreNotificationProviderService from '../../../../modules/store-notification/service';
import type { StoreNotification } from '../../../../types/store-notification';
import { StoreNotificationStatus } from '../../../../types/store-notification';

type StepInput = {
	storeNotification: StoreNotification;
	customerIds: string[];
};

// TODO: Add other whitelist variables here
const whiteListVariables = {
	account_name: '{{account_name}}',
};

async function handler(input: StepInput, { container }: StepExecutionContext) {
	const { storeNotification, customerIds } = input;
	const notificationService = container.resolve(Modules.NOTIFICATION);
	const storeNotificationsService: StoreNotificationProviderService =
		container.resolve(STORE_NOTIFICATION_MODULE);

	try {
		const notifications = await serializeNotifications(
			storeNotification,
			customerIds,
			{ container },
		);

		await notificationService.createNotifications(notifications);

		return new StepResponse({
			sent: customerIds.length,
			success: true,
			message: `Successfully sent ${customerIds.length} notifications`,
		});
	} catch (error) {
		// Update status to FAILED
		await storeNotificationsService.updateStoreNotificationModels({
			id: storeNotification.id,
			status: StoreNotificationStatus.FAILED,
		});

		return new StepResponse({
			sent: 0,
			success: false,
			message: `Failed to send notifications: ${error.message}`,
		});
	}
}

export const sendNotification = createStep('send-notification', handler);

// get all customers
const getCustomers = async (
	customerIds: string[],
	{ container }: { container: MedusaContainer },
) => {
	const customerService: ICustomerModuleService = container.resolve(
		Modules.CUSTOMER,
	);

	const customer = await customerService.listCustomers({
		id: customerIds,
	});

	const customersAccountName = customer.map((customer) => {
		const { id, first_name = '', last_name = '' } = customer;
		return {
			id,
			account_name: `${first_name} ${last_name}`.trim(),
		};
	});
	return customersAccountName;
};

/**
 * Replaces variables in notification messages.
 *
 * Supports multiple variable types as defined in whiteListVariables.
 * To add support for a new variable:
 * 1. First add the variable to whiteListVariables
 * 2. Add a condition in this function to check for and replace that variable
 *
 * @example
 * // Example of adding support for a new variable
 * if (messageText.includes(whiteListVariables.store_name)) {
 *   // Get store name from store service
 *   const storeName = await getStoreName(container);
 *   // Replace {{store_name}} with actual store name
 *   replacedText = replacedText.replace(
 *     new RegExp(whiteListVariables.store_name, 'g'),
 *     storeName
 *   );
 * }
 *
 * @param messageText - Original message text containing variables
 * @param notifications - Array of notifications to update messages for
 * @param options - Additional options with container for accessing services
 * @returns Notifications with variables replaced
 */
const buildNotificationTemplate = async (
	messageText: string,
	notifications: CreateNotificationDTO[],
	{ container }: { container: MedusaContainer },
) => {
	// if included account_name
	if (messageText.includes(whiteListVariables.account_name)) {
		// loop each customer
		const customerIds = notifications.map((notification) => notification.to);
		const customers = await getCustomers(customerIds, { container });

		for (const notification of notifications) {
			const customer = customers.find(
				(customer) => customer.id === notification.to,
			);
			if (customer) {
				const replacedText = messageText.replace(
					new RegExp(whiteListVariables.account_name, 'g'),
					customer.account_name,
				);

				notification.content.text = replacedText;
				notification.data.text = replacedText;
			}
		}
	}

	// If there are any other whitelist variables, add their handling logic here

	return notifications;
};

/**
 * Creates notifications with variables in messages replaced
 *
 * @param storeNotification - Notification data to send
 * @param customerIds - Array of customer IDs to receive the notification
 * @param options - Additional options
 * @param options.container - Container for accessing services
 * @returns Notifications ready to send
 */
const serializeNotifications = async (
	storeNotification: StoreNotification,
	customerIds: string[],
	{ container }: { container: MedusaContainer },
) => {
	const notifications: CreateNotificationDTO[] = [];

	const { subject_line, description, image_url, category, id } =
		storeNotification;

	const checkWhiteListVariables = Object.values(whiteListVariables).some(
		(template) => description.includes(template),
	);

	for (const customerId of customerIds) {
		notifications.push({
			channel: 'store-notification',
			template: 'default',
			to: customerId,
			content: {
				subject: subject_line,
				text: description,
			},
			data: {
				subject: subject_line,
				text: description,
				image_url: image_url,
				category: category,
				notification_id: id,
				is_read: false,
			},
			receiver_id: customerId,
			resource_type: 'store_notification',
		});
	}

	// if not included in the whitelist, return
	if (!checkWhiteListVariables) {
		return notifications;
	}

	// build notification text
	const serializedNotifications = await buildNotificationTemplate(
		description,
		notifications,
		{ container },
	);
	return serializedNotifications;
};
