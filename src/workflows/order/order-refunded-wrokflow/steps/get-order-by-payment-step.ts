import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { IPaymentModuleService } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';

interface Input {
	paymentId: string;
}

const getOrderByPaymentStep = createStep(
	'get-order-by-payment-step',
	async (input: Input, { container }) => {
		const paymentService: IPaymentModuleService = container.resolve(
			Modules.PAYMENT,
		);
		const payment = await paymentService
			.listPayments(
				{
					id: input.paymentId,
				},
				{
					take: 1,
					select: ['payment_collection_id'],
				},
			)
			.then((res) => res[0]);

		const query = container.resolve(ContainerRegistrationKeys.QUERY);
		const { data } = await query.graph({
			entity: 'payment_collection',
			filters: {
				id: payment.payment_collection_id,
			},
			fields: ['order.*'],
			pagination: {
				take: 1,
				skip: 0,
			},
		});

		const order = data[0]?.order || null;
		return new StepResponse({
			order,
		});
	},
);

export default getOrderByPaymentStep;
