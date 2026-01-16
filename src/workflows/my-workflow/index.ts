import {
	createWorkflow,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import { fooStep } from './steps/foo-step';
import barStep from './steps/bar-step';

export type MyWorkflowInput = {
	id: string;
	name: string;
};

const myWorkflow = createWorkflow('my-workflow', (input: MyWorkflowInput) => {
	const foo = fooStep(input);
	const bar = barStep(input);

	return new WorkflowResponse({
		foo,
		bar,
	});
});

export default myWorkflow;
