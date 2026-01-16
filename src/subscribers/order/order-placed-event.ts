import type { SubscriberConfig } from '@medusajs/framework/subscribers';
import orderPlacedWorkflow from '../../workflows/order/order-placed-wrokflow';

export default async function orderPlacedEventHandler({ event, container }) {
	const orderId = event.data.id;

	await orderPlacedWorkflow(container).run({
		input: {
			id: orderId,
		},
	});
}

export const config: SubscriberConfig = {
	event: 'order.placed',
	context: {
		subscriberId: 'order-placed-event',
	},
};
