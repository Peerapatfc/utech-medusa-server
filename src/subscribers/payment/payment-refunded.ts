import type {
	SubscriberArgs,
	SubscriberConfig,
} from '@medusajs/framework/subscribers';
import orderRefundedWorkflow from '../../workflows/order/order-refunded-wrokflow';

export default async function paymentRefundedHandler({
	event,
	container,
}: SubscriberArgs<{ id: string }>) {
	const { id: paymentId } = event.data;

	await orderRefundedWorkflow(container).run({
		input: {
			paymentId,
		},
	});
}

export const config: SubscriberConfig = {
	event: 'payment.refunded',
	context: {
		subscriberId: 'payment-refunded',
	},
};
