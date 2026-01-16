import {
	createWorkflow,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import getPromotionsStep from './steps/get-promotions-step';
import mappingPromotionsStep from './steps/mapping-promotions-step';

export type GetPromotionListWorkflowInput = {
	customer_id?: string;
	limit: number;
	offset: number;
	is_new_customers: boolean;
	q: string;
};

const getPromotionListWorkflow = createWorkflow(
	'get-promotion-list-workflow',
	(input: GetPromotionListWorkflowInput) => {
		// step1: get promotion list
		const { promotions } = getPromotionsStep(input);

		// step2: mapping promotion
		const { coupons, count, offset, limit } = mappingPromotionsStep({
			promotions,
			params: input,
		});

		return new WorkflowResponse({
			coupons,
			count,
			offset,
			limit,
		});
	},
);

export default getPromotionListWorkflow;
