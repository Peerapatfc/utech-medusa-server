import type { CustomerDTO } from '@medusajs/framework/types';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';

export type GetRegisteredUsersCountStepInput = {
	customers: CustomerDTO[];
};

export const getRegisteredUsersCountStep = createStep(
	'get-registered-users-count-step',
	async (input: GetRegisteredUsersCountStepInput, { container }) => {
		const count = input.customers.length;
		return new StepResponse(count);
	},
);
