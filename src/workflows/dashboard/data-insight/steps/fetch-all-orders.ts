import type { AdminOrder } from '@medusajs/framework/types';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import { getOrdersListWorkflow } from '@medusajs/medusa/core-flows';

export type FetchAllOrdersStepInput = Record<string, unknown>;

export const fetchAllOrdersStep = createStep(
	'fetch-all-orders-step',
	async (
		input: FetchAllOrdersStepInput,
		{ container },
	): Promise<StepResponse<AdminOrder[]>> => {
		const { result: ordersList } = (await getOrdersListWorkflow(container).run({
			input: {
				fields: [
					'status',
					'created_at',
					'payment_collections.amount',
					'items.quantity',
					'items.product_id',
					'payment_status',
				],
			},
		})) as unknown as { result: AdminOrder[] };

		return new StepResponse(ordersList || []);
	},
);
