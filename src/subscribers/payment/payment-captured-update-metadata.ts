import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils';
import type {
	IOrderModuleService,
	IPaymentModuleService,
	Logger,
} from '@medusajs/framework/types';
import type {
	SubscriberArgs,
	SubscriberConfig,
} from '@medusajs/framework/subscribers';
import generateRunningNoWorkflow from '../../workflows/order/generate-running-no';
import { RunningNumberConfigType } from '../../types/running-number-config';

export default async function paymentCapturedUpdateMetadataHandler({
	event,
	container,
}: SubscriberArgs<{ id: string }>) {
	const { id: paymentId } = event.data;
	const logger: Logger = container.resolve('logger');
	const paymentService: IPaymentModuleService = container.resolve(
		Modules.PAYMENT,
	);
	const orderService: IOrderModuleService = container.resolve(Modules.ORDER);
	const query = container.resolve(ContainerRegistrationKeys.QUERY);

	const payment = await paymentService
		.listPayments({ id: paymentId }, { take: 1 })
		.then((res) => res[0]);

	if (!payment) {
		logger.error(`Payment with id ${paymentId} not found`);
		return;
	}

	const { data } = await query.graph({
		entity: 'payment_collection',
		filters: {
			id: payment.payment_collection_id,
		},
		fields: ['*', 'order.*'],
		pagination: {
			take: 1,
			skip: 0,
		},
	});

	const paymentCollection = data[0];
	if (!paymentCollection) {
		logger.error(
			`Payment collection with id ${payment.payment_collection_id} not found`,
		);
		return;
	}

	let invoiceNo = '';
	const { result } = await generateRunningNoWorkflow(container).run({
		input: {
			type: RunningNumberConfigType.INVOICE_NO,
		},
	});
	invoiceNo = result.generatedNo;
	if (invoiceNo) {
		const updateMetadata = paymentCollection?.order?.metadata;
		const orderId = paymentCollection?.order?.id;
		await orderService.updateOrders([
			{
				id: orderId,
				metadata: {
					...updateMetadata,
					invoice_no: invoiceNo,
				},
			},
		]);
	}
}

export const config: SubscriberConfig = {
	event: 'payment.captured',
	context: {
		subscriberId: 'update-order-metadata-on-payment-captured',
	},
};
