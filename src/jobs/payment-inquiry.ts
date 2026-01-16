import type {
	MedusaContainer,
	OrderDetailDTO,
} from '@medusajs/framework/types';
import { OrderStatus } from '@medusajs/framework/utils';
import {
	capturePaymentWorkflow,
	getOrdersListWorkflow,
} from '@medusajs/medusa/core-flows';
import paymentInquiryWorkflow from '../workflows/payment-inquiry';

export default async function handlerPaymentInquiry(
	container: MedusaContainer,
) {
	const logger = container.resolve('logger');

	if (process.env.NODE_ENV === 'development') {
		return;
	}

	logger.info('[cron]: Payment inquiry worker is starting...');

	const { result: orders } = (await getOrdersListWorkflow(container).run({
		input: {
			fields: [
				'id',
				'status',
				'payment_status',
				'email',
				'payment_collections.id',
				'payment_collections.payments.id',
			],
			variables: {
				filters: {
					status: [OrderStatus.PENDING],
				},
			},
		},
	})) as unknown as { result: OrderDetailDTO[] };

	const workflow = capturePaymentWorkflow(container);
	for await (const order of orders) {
		if (order.payment_status !== 'authorized') continue;

		const payment = order.payment_collections[0]?.payments[0];
		if (!payment) continue;

		const paymentProviderId = payment?.provider_id;
		if (!paymentProviderId || paymentProviderId === 'pp_system_default') {
			continue;
		}

		const {
			result: { inquiry },
		} = await paymentInquiryWorkflow(container).run({
			input: {
				orderId: order.id,
			},
		});
		if (inquiry.status !== 'success') continue;

		const paymentId = payment.id;
		await workflow.run({
			input: {
				payment_id: paymentId,
			},
		});
		logger.info(`order: ${order.id} has been captured by payment-inquiry-job`);
	}

	logger.info('[cron]: Payment inquiry worker has finished');
}

export const config = {
	name: 'payment-inquiry-job',
	schedule: '* * * * *',
};
