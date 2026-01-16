import type { CreateNotificationDTO } from '@medusajs/framework/types';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import { Modules } from '@medusajs/utils';
import type { CustomerProductFlashSale } from '@customTypes/price-list-custom';

type StepInput = {
	customerProductFlashSales: CustomerProductFlashSale[];
};

async function handler(input: StepInput, { container }) {
	const { customerProductFlashSales } = input;
	const notificationService = container.resolve(Modules.NOTIFICATION);

	try {
		const notifications: CreateNotificationDTO[] = [];
		for (const customerProductFlashSale of customerProductFlashSales) {
			const subject = 'สินค้าที่คุณสนใจได้มีการร่วมโปรโมชั่น';
			const text = `${customerProductFlashSale.product.title} ได้ร่วมโปรโมชั่น คุณสามารถดูรายละเอียดสินค้าเพิ่มเติมได้ที่หน้าสินค้า หรือหน้าหลักของร้าน`;
			const image_url = customerProductFlashSale.product.thumbnail ?? '';
			for (const customer of customerProductFlashSale.customers) {
				notifications.push({
					channel: 'store-notification',
					template: 'default',
					to: customer.id,
					content: {
						subject,
						text,
					},
					data: {
						subject,
						text,
						image_url,
						category: 'promotion',
						notification_id: '',
						is_read: false,
					},
					receiver_id: customer.id,
					resource_type: 'store_notification',
				});
			}
		}
		if (notifications.length > 0) {
			await notificationService.createNotifications(notifications);
			return new StepResponse({
				sent: notifications.length,
				success: true,
				message: `Successfully sent ${notifications.length} notifications`,
			});
		}
		return new StepResponse({
			sent: notifications.length,
			success: false,
			message: 'No notifications were sent successfully',
		});
	} catch (error) {
		return new StepResponse({
			sent: 0,
			success: false,
			message: `Failed to send notifications: ${error.message}`,
		});
	}
}

export const sendFlashSaleNotification = createStep(
	{
		name: 'send-flash-sale-notification-wishlist',
	},
	handler,
);
