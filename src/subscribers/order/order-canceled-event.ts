import type { SubscriberConfig } from '@medusajs/framework/subscribers';
import restockNotificationOrderWorkflow from '../../workflows/notifications/restock-notification/order-workflow';
import orderCanceledWorkflow from '../../workflows/order/order-canceled-wrokflow';

export default async function orderCanceledEventHandler({ event, container }) {
	const orderId = event.data.id;

	await orderCanceledWorkflow(container).run({
		input: {
			id: orderId,
		},
	});

	await restockNotificationOrderWorkflow(container).run({
		input: {
			orderId: orderId,
		},
	});
}

export const config: SubscriberConfig = {
	event: 'order.canceled',
	context: {
		subscriberId: 'order-canceled-event',
	},
};
