import type { ICustomerModuleService } from '@medusajs/framework/types';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import { Modules } from '@medusajs/utils';
import { STORE_NOTIFICATION_MODULE } from '../../../../modules/store-notification';
import type StoreNotificationProviderService from '../../../../modules/store-notification/service';
import {
	StoreNotificationRecipientType,
	StoreNotificationStatus,
} from '../../../../types/store-notification';
import type { StoreNotification } from '../../../../types/store-notification';

type StepInput = {
	storeNotification: StoreNotification;
};

async function handler(input: StepInput, { container }) {
	const { storeNotification } = input;
	const customerService: ICustomerModuleService = container.resolve(
		Modules.CUSTOMER,
	);
	const storeNotificationsService: StoreNotificationProviderService =
		container.resolve(STORE_NOTIFICATION_MODULE);

	const updateNotificationStatus = async (
		status: StoreNotificationStatus,
		errorMessage: string,
	) => {
		await storeNotificationsService.updateStoreNotificationModels({
			id: storeNotification.id,
			status,
		});
		throw new Error(errorMessage);
	};

	let customerIds: string[] = [];

	switch (storeNotification.recipient_type) {
		case StoreNotificationRecipientType.ALL: {
			const customers = await customerService.listCustomers(
				{},
				{
					select: ['id'],
					filters: { has_account: true },
				},
			);
			customerIds = customers.map((customer) => customer.id);

			if (!customerIds.length) {
				await updateNotificationStatus(
					StoreNotificationStatus.FAILED,
					'No customers found with accounts',
				);
			}
			break;
		}

		case StoreNotificationRecipientType.TARGETING: {
			if (!storeNotification.customer_group_ids?.length) {
				await updateNotificationStatus(
					StoreNotificationStatus.FAILED,
					'No customer group IDs provided for targeting recipient type',
				);
			}

			const groupCustomerIds = await Promise.all(
				storeNotification.customer_group_ids.map(async (groupId) => {
					const groupCustomers = await customerService.listCustomers(
						{ groups: [groupId] },
						{ select: ['id'] },
					);
					return groupCustomers.map((c) => c.id);
				}),
			);

			customerIds = [...new Set(groupCustomerIds.flat())];

			if (!customerIds.length) {
				await updateNotificationStatus(
					StoreNotificationStatus.FAILED,
					'No customers found in the specified customer groups',
				);
			}
			break;
		}

		case StoreNotificationRecipientType.SPECIFIC: {
			if (!storeNotification.customer_ids?.length) {
				await updateNotificationStatus(
					StoreNotificationStatus.FAILED,
					'No customer IDs provided for specific recipient type',
				);
			}

			const customers = await customerService.listCustomers({
				id: storeNotification.customer_ids,
			});
			customerIds = customers.map((customer) => customer.id);

			if (!customerIds.length) {
				await updateNotificationStatus(
					StoreNotificationStatus.FAILED,
					'None of the specified customer IDs were found',
				);
			}
			break;
		}
	}

	return new StepResponse({ customerIds });
}

export const getRecipient = createStep('get-recipient', handler);
