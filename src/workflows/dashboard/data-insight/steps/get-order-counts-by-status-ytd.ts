import type { AdminOrder } from '@medusajs/framework/types';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import { getOrdersYearToDate } from '../utils/get-order-year-to-date';

export type GetOrderCountsByStatusYTDStepInput = {
	year?: number;
	allOrders: AdminOrder[];
};

interface OrderCountsByStatusYTD {
	counts: Record<string, number>;
}

export const getOrderCountsByStatusYTDStep = createStep(
	'get-order-counts-by-status-ytd-step',
	async (input: GetOrderCountsByStatusYTDStepInput, { container }) => {
		const ytdOrders = getOrdersYearToDate(input.allOrders);

		const counts = ytdOrders.reduce(
			(acc, order) => {
				acc[order.status] = (acc[order.status] || 0) + 1;
				return acc;
			},
			{} as Record<string, number>,
		);

		return new StepResponse({
			counts,
		});
	},
);
