import { StoreNotificationCategory } from '@customTypes/store-notification';
import type { INotificationModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import type { CustomerWithProduct, NotificationResult } from '../types';

export const createNotificationsInventoryStep = createStep(
	'create-notifications-inventory',
	async (
		input: {
			customersWithProducts: CustomerWithProduct[];
		},
		{ container },
	): Promise<StepResponse<NotificationResult>> => {
		const { customersWithProducts } = input;

		const notificationService: INotificationModuleService = container.resolve(
			Modules.NOTIFICATION,
		);

		const notificationPromises = customersWithProducts.map(
			({ customer, productTitle }) => {
				const subject = 'สินค้าที่คุณสนใจได้มีการเพิ่มเข้าสต็อค';
				const text = `${productTitle} ได้มีการเพิ่มจำนวนสินค้าเข้าสต็อค คุณสามารถดูรายละเอียดสินค้าเพิ่มเติมได้ที่หน้าสินค้า`;

				return {
					channel: 'store-notification',
					template: 'default',
					to: customer.id,
					content: {
						subject,
						text,
					},
					data: {
						category: StoreNotificationCategory.ANNOUNCEMENT,
						is_read: false,
						subject,
						text,
					},
					receiver_id: customer.id,
					resource_type: '',
				};
			},
		);

		const notifications =
			await notificationService.createNotifications(notificationPromises);

		return new StepResponse({
			notificationsCreated: customersWithProducts.length,
			customers: customersWithProducts.map(({ customer }) => customer.id),
			notifications,
			success: true,
		});
	},
);
