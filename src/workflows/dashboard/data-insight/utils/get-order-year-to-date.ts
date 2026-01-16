import type { AdminOrder } from '@medusajs/framework/types';

export function getOrdersYearToDate(
	allOrders: AdminOrder[],
	year?: number,
): AdminOrder[] {
	const targetYear = year || new Date().getFullYear();
	const yearStartDate = new Date(targetYear, 0, 1);
	const todayEndDate = new Date();

	return allOrders.filter((order) => {
		const orderDate = new Date(order.created_at);
		return orderDate >= yearStartDate && orderDate <= todayEndDate;
	});
}
