import {
	createWorkflow,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import deleteProductInStrapiStep from './steps/delete-product-in-strapi-step';

export type ProductCreatedWorkflowInput = {
	id: string;
};

export const THREE_DAYS = 60 * 60 * 24 * 3;
export const productDeletedWorkflowId = 'product-deleted-workflow';

const productDeletedWorkflow = createWorkflow(
	{
		name: productDeletedWorkflowId,
		store: true,
		idempotent: true,
		retentionTime: THREE_DAYS,
	},
	(input: ProductCreatedWorkflowInput) => {
		deleteProductInStrapiStep({
			id: input.id,
		});

		return new WorkflowResponse({
			input,
		});
	},
);

export default productDeletedWorkflow;
