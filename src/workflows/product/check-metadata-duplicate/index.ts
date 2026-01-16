import {
	WorkflowResponse,
	createWorkflow,
} from '@medusajs/framework/workflows-sdk';
import checkMetadataDuplicateStep from './steps/check-metadata-duplicate-step';

export type CheckMetadataDuplicateWorkflowInput = {
	metadata_key: string;
	metadata_value: string;
	current_product_id: string;
};

export type CheckMetadataDuplicateWorkflowOutput = {
	is_duplicate: boolean;
	metadata_key: string;
	metadata_value: string;
	conflicting_product: {
		id: string;
		title: string;
		handle: string;
		conflicting_value: string;
	} | null;
};

const checkMetadataDuplicateWorkflow = createWorkflow(
	'check-metadata-duplicate-workflow',
	(input: CheckMetadataDuplicateWorkflowInput) => {
		const duplicateResult = checkMetadataDuplicateStep({
			input,
		});

		return new WorkflowResponse(duplicateResult);
	},
);

export default checkMetadataDuplicateWorkflow;
