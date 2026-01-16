import type { AdminOrder } from '@medusajs/framework/types';
import { OrderStatus } from '@medusajs/framework/utils';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import { getOrdersListWorkflow } from '@medusajs/medusa/core-flows';

export const getPaidCountStep = createStep(
	'get-paid-count-step',
	async ({ product_ids }: { product_ids: string[] }, { container }) => {
		const workflow = getOrdersListWorkflow(container);

		const orderQueries = product_ids.map((product_id) =>
			workflow.run({
				input: {
					fields: ['items.quantity', 'items.product_id'],
					variables: {
						filters: {
							status: [OrderStatus.PENDING, OrderStatus.COMPLETED],
							items: {
								product_id,
							},
						},
					},
				},
			}),
		);

		const results = await Promise.all(orderQueries);

		const PAID_STATUSES = ['captured'];

		const paidCount = product_ids.map((product_id, index) => {
			const { result: orders } = results[index] as unknown as {
				result: AdminOrder[];
			};

			// Filter orders by payment status
			const capturedOrders = orders.filter((order) =>
				PAID_STATUSES.includes(order.payment_status),
			);

			// Calculate total quantity for the product
			const totalQuantity = capturedOrders.reduce((acc, order) => {
				const productItemsQuantity = order.items
					.filter((item) => item.product_id === product_id)
					.reduce((sum, item) => sum + item.quantity, 0);

				return acc + productItemsQuantity;
			}, 0);

			return {
				id: product_id,
				paidCount: totalQuantity,
			};
		});

		return new StepResponse({
			paidCount,
		});
	},
);
