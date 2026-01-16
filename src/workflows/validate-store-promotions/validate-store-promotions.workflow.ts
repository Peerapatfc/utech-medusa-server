import { when } from '@medusajs/framework/workflows-sdk';
import { WorkflowResponse, createWorkflow } from '@medusajs/workflows-sdk';
import getActivePromotionsStep from './steps/get-active-promotions';
import sortPromotionsStep from './steps/sort-promotions';
import validatePromotionUsabilityStep from './steps/validate-promotion-usability';
import validateSubtotalRulesStep from './steps/validate-subtotal-rules';
import type { PromotionWorkflowInput } from './types';

const validateStorePromotionsWorkflow = createWorkflow(
	'validate-store-promotions',
	(input: PromotionWorkflowInput & { validate_only?: boolean }) => {
		const context = getActivePromotionsStep(input);

		const withUsabilityValidation = validatePromotionUsabilityStep(context);

		const withSubtotalValidation = validateSubtotalRulesStep(
			withUsabilityValidation,
		);

		when('validate-only-check', input, (input) => input.validate_only).then(
			() => {
				return new WorkflowResponse(withSubtotalValidation.promotions);
			},
		);

		const sortedPromotions = sortPromotionsStep(withSubtotalValidation);
		return new WorkflowResponse(sortedPromotions.promotions);
	},
);

export default validateStorePromotionsWorkflow;
