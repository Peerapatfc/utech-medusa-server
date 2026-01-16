import type { CustomerDTO } from '@medusajs/framework/types';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';

export type GetUserRegistrationTrendStepInput = {
	customers: CustomerDTO[];
	days_ago?: number; // Optional: number of days to look back, defaults to 7
};

const DEFAULT_DAYS_AGO = 7;

export const getUserRegistrationTrendStep = createStep(
	'get-user-registration-trend-step',
	async (
		input: GetUserRegistrationTrendStepInput,
		{ container },
	): Promise<StepResponse<Array<{ date: string; count: number }>>> => {
		const dailyRegistrationDataMap = new Map<string, number>();
		const daysToQuery = input.days_ago || DEFAULT_DAYS_AGO;
		const today = new Date();
		const startDate = new Date(today);
		startDate.setDate(today.getDate() - (daysToQuery - 1));
		startDate.setHours(0, 0, 0);

		// Initialize map for all days in the range to ensure all days are present in the output
		for (let i = 0; i < daysToQuery; i++) {
			const targetDate = new Date(startDate);
			targetDate.setDate(startDate.getDate() + i);
			const formattedDate = targetDate.toLocaleDateString('en-GB', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
			});
			dailyRegistrationDataMap.set(formattedDate, 0);
		}

		const filteredCustomers = input.customers.filter((customer) => {
			const registrationDate = new Date(customer.created_at);
			return registrationDate >= startDate;
		});

		for (const customer of filteredCustomers) {
			const registrationDate = new Date(customer.created_at);
			const formattedDate = registrationDate.toLocaleDateString('en-GB', {
				day: 'numeric',
				month: 'short',
				year: 'numeric',
			});
			if (dailyRegistrationDataMap.has(formattedDate)) {
				dailyRegistrationDataMap.set(
					formattedDate,
					(dailyRegistrationDataMap.get(formattedDate) || 0) + 1,
				);
			}
		}

		const dailyRegistrationData = Array.from(
			dailyRegistrationDataMap.entries(),
		).map(([date, count]) => ({ date, count }));

		// Ensure the order is from oldest to newest
		dailyRegistrationData.sort(
			(a, b) =>
				new Date(a.date.split('/').reverse().join('-')).getTime() -
				new Date(b.date.split('/').reverse().join('-')).getTime(),
		);

		return new StepResponse(dailyRegistrationData);
	},
);
