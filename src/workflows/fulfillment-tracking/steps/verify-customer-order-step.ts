import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { Logger } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

export interface VerifyCustomerOrderInput {
	order_id: string;
	customer_id?: string;
}

const verifyCustomerOrderStep = createStep(
	'verify-customer-order-step',
	async (input: VerifyCustomerOrderInput, { container }) => {
		const { order_id, customer_id } = input;
		const logger: Logger = container.resolve('logger');

		try {
			const orderModuleService = container.resolve(Modules.ORDER);
			const order = await orderModuleService.retrieveOrder(order_id, {
				select: ['id', 'customer_id'],
			});

			if (!order) {
				return new StepResponse(null);
			}

			if (order.customer_id !== customer_id) {
				return new StepResponse(null);
			}

			return new StepResponse({ order_id });
		} catch (error) {
			logger.error('Failed to verify customer order access:', error);
			throw error;
		}
	},
);

export default verifyCustomerOrderStep;
