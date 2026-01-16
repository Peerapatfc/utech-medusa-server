import type { MedusaContainer } from '@medusajs/framework/types';
import flashSalePushNotificationWishlistWorkflow from '../workflows/notifications/push-notification-flash-sale-wishlist';

export default async function handlerFlashSaleNotificationWishlist(
	container: MedusaContainer,
) {
	if (process.env.NODE_ENV === 'development') {
		return;
	}

	await flashSalePushNotificationWishlistWorkflow(container).run();
}

export const config = {
	name: 'flash-sale-notification',
	schedule: '* * * * *',
};
