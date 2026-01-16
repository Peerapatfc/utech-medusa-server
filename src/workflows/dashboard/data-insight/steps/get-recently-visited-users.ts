import type { CustomerDTO } from '@medusajs/framework/types';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
export type GetRecentlyVisitedUsersStepInput = {
	limit?: number;
	customers: CustomerDTO[];
};

export const getRecentlyVisitedUsersStep = createStep(
	'get-recently-visited-users-step',
	async (input: GetRecentlyVisitedUsersStepInput, _context: unknown) => {
		const { customers, limit } = input;

		const lastLoginAt = customers.filter(
			(customer) => customer?.metadata?.last_login_at,
		);

		const lastLoginAtSorted = lastLoginAt.sort((a, b) => {
			const dateA = new Date(a.metadata.last_login_at as string);
			const dateB = new Date(b.metadata.last_login_at as string);
			return dateB.getTime() - dateA.getTime();
		});

		const limitData = lastLoginAtSorted.slice(0, limit);

		const returnData = limitData.map((customer) => {
			return {
				user_id: customer.id,
				name: `${customer.first_name ?? ''} ${customer.last_name ?? ''}`,
				last_visit: customer.metadata.last_login_at,
			};
		});

		return new StepResponse(returnData);
	},
);
