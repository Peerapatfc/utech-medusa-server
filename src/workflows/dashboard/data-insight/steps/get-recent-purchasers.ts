import type { AdminOrder } from '@medusajs/framework/types';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import { getPaymentCapturedOrder } from '../utils/get-payment-captured-order';

export type GetRecentPurchasersStepInput = {
	days_ago?: number;
	startDate?: string;
	endDate?: string;
	allOrders: AdminOrder[];
};

export const getRecentPurchasersStep = createStep(
	'get-recent-purchasers-step',
	async (input: GetRecentPurchasersStepInput, { container }) => {
		const { allOrders, days_ago } = input;
		const dailyPurchaserData = [];
		const today = new Date();

		const sixDaysAgo = new Date(today);
		sixDaysAgo.setDate(today.getDate() - days_ago);
		const startOfSixDaysAgo = new Date(sixDaysAgo);
		startOfSixDaysAgo.setHours(0, 0, 0, 0);

		const recentOrders = allOrders.filter((order) => {
			const orderDate = new Date(order.created_at);
			return orderDate >= startOfSixDaysAgo && orderDate <= today;
		});

		const capturedOrders = getPaymentCapturedOrder(recentOrders);

		for (let i = days_ago; i >= 0; i--) {
			const date = new Date(today);
			date.setDate(today.getDate() - i);
			const formattedDate = date.toLocaleDateString('en-GB', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
			});
			dailyPurchaserData.push({ date: formattedDate, count: 0 });
		}

		for (const order of capturedOrders) {
			const orderDate = new Date(order.created_at).toLocaleDateString('en-GB', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
			});
			const dayData = dailyPurchaserData.find((d) => d.date === orderDate);
			if (dayData) {
				dayData.count += 1;
			}
		}

		return new StepResponse(dailyPurchaserData);
	},
);
