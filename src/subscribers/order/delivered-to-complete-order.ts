import type { SubscriberArgs } from '@medusajs/framework/subscribers';
import type { Logger } from '@medusajs/framework/types';
import {
	ContainerRegistrationKeys,
	FulfillmentEvents,
} from '@medusajs/framework/utils';
import type { SubscriberConfig } from '@medusajs/medusa';
import {
	completeOrderWorkflow,
	getOrderDetailWorkflow,
} from '@medusajs/medusa/core-flows';
import { defaultAdminOrderFields } from '../../utils/query-configs/order';

export default async function orderShippedOrDeliveredToCompletedOrderHandler({
	event: { data },
	container,
}: SubscriberArgs<{ id: string }>) {
	const logger: Logger = container.resolve('logger');
	const query = container.resolve(ContainerRegistrationKeys.QUERY);

	const fulfillmentId = data.id;
	const { data: fulfillments } = await query.graph({
		entity: 'fulfillment',
		fields: ['id', 'order.id'],
		filters: {
			id: fulfillmentId,
		},
		pagination: {
			take: 1,
			skip: 0,
		},
	});

	const fulfillment = fulfillments[0];
	if (!fulfillment || !fulfillment.order) {
		logger.error(`No order found for fulfillment: ${fulfillmentId}`);
		return;
	}

	const { result: order } = await getOrderDetailWorkflow(container).run({
		input: {
			fields: defaultAdminOrderFields,
			order_id: fulfillment.order.id,
		},
	});

	if (order.status === 'pending' && order.payment_status === 'captured') {
		logger.info(`Completing order with id ${order.id}`);
		await completeOrderWorkflow(container).run({
			input: {
				orderIds: [order.id],
			},
		});
	}
}

export const config: SubscriberConfig = {
	event: [FulfillmentEvents.DELIVERY_CREATED],
	context: {
		subscriberId: 'order-delivered-to-complete-order',
	},
};
