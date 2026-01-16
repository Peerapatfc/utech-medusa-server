import type {
	SubscriberArgs,
	SubscriberConfig,
} from '@medusajs/framework/subscribers';
import type { IPaymentModuleService, Logger } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import {
	completeOrderWorkflow,
	getOrderDetailWorkflow,
} from '@medusajs/medusa/core-flows';
import { defaultAdminOrderFields } from '../../utils/query-configs/order';
import updateProductScoreWorkflow from '../../workflows/product/update-products-score-workflow';
import { CustomerGroupName } from '../../types/customer-group';

export default async function paymentCapturedToCompleteOrderHandler({
	event,
	container,
}: SubscriberArgs<{ id: string }>) {
	const { id: paymentId } = event.data;
	const logger: Logger = container.resolve('logger');
	const paymentService: IPaymentModuleService = container.resolve(
		Modules.PAYMENT,
	);
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
	if (!paymentCollection || !paymentCollection.order) {
		logger.error(`No order found for payment: ${paymentId}`);
		return;
	}

	const { result: order } = await getOrderDetailWorkflow(container).run({
		input: {
			fields: defaultAdminOrderFields,
			order_id: paymentCollection.order.id,
		},
	});

	if (['shipped', 'delivered'].includes(order.fulfillment_status)) {
		logger.info(`Completing order with id ${order.id}`);
		await completeOrderWorkflow(container).run({
			input: {
				orderIds: [order.id],
			},
		});
	}

	//call the workflow
	updateProductScoreWorkflow(container).run({
		input: {
			productIds: order.items.map((item) => item.product_id),
		},
	});

	const customer_id = order.customer_id;
	if (customer_id) {
		const customerModuleService = container.resolve(Modules.CUSTOMER);
		const { data: customer } = await query.graph({
			entity: 'customer',
			fields: ['*', 'groups.*'],
			filters: {
				id: customer_id,
			},
			pagination: {
				take: 1,
				skip: 0,
			},
		});
		const newMemberGroup = customer[0]?.groups.find(
			(group) => group.name === CustomerGroupName.NEW_MEMBER,
		);
		const newMemberGroupId = newMemberGroup?.id;
		if (newMemberGroupId) {
			await customerModuleService.removeCustomerFromGroup({
				customer_id,
				customer_group_id: newMemberGroupId,
			});
		}
	}
}

export const config: SubscriberConfig = {
	event: 'payment.captured',
	context: {
		subscriberId: 'captured-to-complete-order',
	},
};
