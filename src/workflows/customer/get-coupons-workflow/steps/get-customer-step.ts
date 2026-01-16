import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { Modules } from '@medusajs/framework/utils';

type CustomerData = {
	id: string;
	metadata?: {
		coupon_ids?: string[];
	};
};

export const getCustomerStep = createStep(
	'get-customer',
	async ({ customerId }: { customerId: string }, { container }) => {
		const customerService = container.resolve(Modules.CUSTOMER);
		const customer = await customerService.retrieveCustomer(customerId);

		return new StepResponse(customer as CustomerData);
	},
);
