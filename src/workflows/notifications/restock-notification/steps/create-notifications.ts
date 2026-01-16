import { StoreNotificationCategory } from '@customTypes/store-notification';
import type { INotificationModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import type {
	CustomerWithProduct,
	NotificationResult,
	OrderItem,
} from '../types';

interface InventoryLevelData {
	stocked_quantity: number;
	reserved_quantity: number;
}

interface InventoryResultData {
	inventory_items?: Array<{
		inventory?: {
			location_levels?: InventoryLevelData[];
		};
	}>;
}

export const createNotificationsStep = createStep(
	'create-notifications',
	async (
		input: {
			customersWithProducts: CustomerWithProduct[];
			orderItems?: OrderItem[];
			inventoryResult?: InventoryResultData[];
		},
		{ container },
	): Promise<StepResponse<NotificationResult>> => {
		const { customersWithProducts, orderItems, inventoryResult } = input;

		if (!inventoryResult?.length || !orderItems?.length) {
			return new StepResponse({
				notificationsCreated: 0,
				customers: [],
				success: false,
				notifications: [],
			});
		}

		const orderItemQty = orderItems.reduce(
			(acc, item) => acc + item.quantity,
			0,
		);

		const inventoryLevel =
			inventoryResult[0]?.inventory_items?.[0]?.inventory?.location_levels?.[0];

		if (!inventoryLevel) {
			return new StepResponse({
				notificationsCreated: 0,
				customers: [],
				success: false,
				notifications: [],
			});
		}

		const inventoryQtyStocked = inventoryLevel.stocked_quantity;
		const inventoryQtyReserved = inventoryLevel.reserved_quantity;
		const qtyBeforeRestock =
			inventoryQtyStocked - inventoryQtyReserved - orderItemQty;

		if (qtyBeforeRestock <= 0) {
			const notificationService: INotificationModuleService = container.resolve(
				Modules.NOTIFICATION,
			);

			const notificationPromises = customersWithProducts.map(
				({ customer, productTitle }) => {
					const subject = 'สินค้าที่คุณสนใจได้มีการเพิ่มเข้าสต็อค';
					const text = `${productTitle} ได้มีการเพิ่มจำนวนสินค้าเข้าสต็อต คุณสามารถดูรายละเอียดสินค้าเพิ่มเติมได้ที่หน้าสินค้า`;

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
		}

		return new StepResponse({
			notificationsCreated: 0,
			customers: [],
			notifications: [],
			success: true,
		});
	},
);
