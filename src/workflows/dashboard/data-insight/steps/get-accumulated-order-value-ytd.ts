import type { AdminOrder } from '@medusajs/framework/types';
import { OrderStatus } from '@medusajs/framework/utils';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import { getOrdersYearToDate } from '../utils/get-order-year-to-date';
import { getPaymentCapturedOrder } from '../utils/get-payment-captured-order';

export type GetAccumulatedOrderValueYTDStepInput = {
	allOrders: AdminOrder[];
};

export const getAccumulatedOrderValueYTDStep = createStep(
	'get-accumulated-order-value-ytd-step',
	async (input: GetAccumulatedOrderValueYTDStepInput, { container }) => {
		const ytdOrders = getOrdersYearToDate(input.allOrders);

		const relevantStatusOrders = ytdOrders.filter(
			(order) =>
				order.status === OrderStatus.PENDING ||
				order.status === OrderStatus.COMPLETED,
		);

		const capturedOrders = getPaymentCapturedOrder(relevantStatusOrders);

		const accumulatedValue = capturedOrders.reduce((acc, order) => {
			return acc + (order.payment_collections?.[0]?.amount || 0);
		}, 0);

		return new StepResponse(accumulatedValue);
	},
);
