import {
	createWorkflow,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import getCurrentFlashSaleStep from '../../common/steps/get-current-flash-sale-step';
import validateCartItemsFlashSaleStep from './steps/validate-cart-items-flash-sale';

export type ValidateCartFlashSaleWorkflowInput = {
	cartId: string;
};

const validateCartFlashSaleWorkflow = createWorkflow(
	'validate-cart-flash-sale',
	(input: ValidateCartFlashSaleWorkflowInput) => {
		const currentFlashSale = getCurrentFlashSaleStep();

		const validateResult = validateCartItemsFlashSaleStep({
			cartId: input.cartId,
			currentFlashSale,
		});

		return new WorkflowResponse(validateResult);
	},
);

export default validateCartFlashSaleWorkflow;
