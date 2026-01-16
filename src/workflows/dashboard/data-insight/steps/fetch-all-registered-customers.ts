import type { ICustomerModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';

export type FetchAllRegisteredCustomersStepInput = Record<string, unknown>;

export const fetchAllRegisteredCustomersStep = createStep(
	'fetch-all-registered-customers-step',
	async (_input: FetchAllRegisteredCustomersStepInput, { container }) => {
		const customerService: ICustomerModuleService = container.resolve(
			Modules.CUSTOMER,
		);

		const [customers] = await customerService.listAndCountCustomers(
			{
				has_account: true,
			},
			{
				select: [
					'id',
					'first_name',
					'last_name',
					'created_at',
					'metadata.last_login_at',
				],
				take: 9999,
			},
		);

		return new StepResponse(customers);
	},
);
