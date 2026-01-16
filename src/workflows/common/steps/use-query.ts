import { ContainerRegistrationKeys } from '@medusajs/utils';
import { createStep, StepResponse } from '@medusajs/workflows-sdk';

interface QueryInput {
	entity: string;
	fields: string[];
	filters?: Record<string, unknown>;
	context?: Record<string, unknown>;
	pagination?: {
		skip: number;
		take?: number;
		order?: Record<string, unknown>;
	};
}

export const useQueryStepId = 'use-query';
export const useQueryStep = createStep(
	useQueryStepId,
	async (data: QueryInput, { container }) => {
		const query = container.resolve(ContainerRegistrationKeys.QUERY);

		const result = await query.graph(data);

		return new StepResponse(result);
	},
);
