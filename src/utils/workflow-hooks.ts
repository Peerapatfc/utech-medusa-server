import type { WorkflowData } from '@medusajs/framework/workflows-sdk';

export const getActorId = (
	additional_data: (
		| Record<string, unknown>
		| WorkflowData<Record<string, unknown>>
	) &
		Record<string, unknown>,
) => {
	const actorId = additional_data?.actor_id
		? (additional_data?.actor_id as string)
		: '';

	return actorId;
};
