import {
	createWorkflow,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import queryOrderDataStep from './steps/query-order-data-step';
import authenticateStep from './steps/authenticate-step';
import fetchExpressInfoStep from './steps/fetch-express-info-step';
import processTrackingDataStep from './steps/process-tracking-data-step';


export type GetFulfillmentTrackingWorkflowInput = {
	order_id: string;
	customer_id?: string;
};

const getFulfillmentTrackingWorkflow = createWorkflow(
	'get-fulfillment-tracking-workflow',
	(input: GetFulfillmentTrackingWorkflowInput) => {
		// Step 1: Query order data to get fulfillment and tracking info
		const order_data = queryOrderDataStep({
			order_id: input.order_id,
		});

		// Step 2: Authenticate with tracking service
		const auth_response = authenticateStep();

		// Step 3: Fetch express info for the tracking number
		const express_info = fetchExpressInfoStep({
			order_data,
			auth_response,
		});

		// Step 4: Process and format tracking data
		const processed_tracking_data = processTrackingDataStep({
			order_data,
			express_info,
		});

		return new WorkflowResponse({
			trackings: processed_tracking_data,
		});
	},
);

export default getFulfillmentTrackingWorkflow;
