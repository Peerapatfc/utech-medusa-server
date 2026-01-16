import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { Logger } from '@medusajs/framework/types';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import type { QueryOrderDataInput } from '../../../types/fulfillment-tracking';

const queryOrderDataStep = createStep(
	'query-order-data-step',
	async (input: QueryOrderDataInput, { container }) => {
		const { order_id } = input;
		const logger: Logger = container.resolve('logger');
		const query = container.resolve(ContainerRegistrationKeys.QUERY);

		try {
			const { data: order_data } = await query.graph({
				entity: 'order',
				fields: [
					'id',
					'fulfillments.labels.id',
					'fulfillments.labels.tracking_number',
					'fulfillments.labels.fulfillment_tracking.id',
					'fulfillments.labels.fulfillment_tracking.current_status',
					'fulfillments.labels.fulfillment_tracking.tracking_events',
					'fulfillments.labels.fulfillment_tracking.updated_at',
				],
				filters: {
					id: order_id,
				},
			});

			if (!order_data || order_data.length === 0) {
				return new StepResponse(null);
			}

			return new StepResponse({ data: order_data });
		} catch (error) {
			logger.error('Failed to query order data:', error);
			throw error;
		}
	},
);

export default queryOrderDataStep;
