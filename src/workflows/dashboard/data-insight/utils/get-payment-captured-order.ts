import type { AdminOrder } from '@medusajs/framework/types';

export const getPaymentCapturedOrder = (ordersList: AdminOrder[]) => {
	const PAID_STATUSES = ['captured'];
	const capturedOrders = ordersList.filter((order) =>
		PAID_STATUSES.includes(order.payment_status),
	);

	return capturedOrders;
};
