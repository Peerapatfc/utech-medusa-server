import {
	createWorkflow,
	WorkflowResponse,
	when,
	transform,
} from '@medusajs/framework/workflows-sdk';
import queryOrderDataStep from './steps/query-order-data-step';
import authenticateStep from './steps/authenticate-step';
import fetchExpressInfoStep from './steps/fetch-express-info-step';
import createFulfillmentTrackingStep from './steps/create-fulfillment-tracking-step';
import updateFulfillmentTrackingStep from './steps/update-fulfillment-tracking-step';
import linkFulfillmentTrackingStep from './steps/link-fulfillment-tracking-step';

export type UpsertFulfillmentTrackingWorkflowInput = {
	order_id: string;
};

const upsertFulfillmentTrackingWorkflow = createWorkflow(
	'upsert-fulfillment-tracking-workflow',
	(input: UpsertFulfillmentTrackingWorkflowInput) => {
		// Step 1: Query order data to get fulfillment and tracking info
		const order_data = queryOrderDataStep({
			order_id: input.order_id,
		});

		// Step 2: Check if fulfillment tracking already exists
		const has_existing_tracking = transform(
			{ order_data },
			({ order_data }) => {
				return !!order_data?.data?.[0]?.fulfillments?.[0]?.labels?.[0]
					?.fulfillment_tracking?.id;
			},
		);

		// Step 3: Authenticate with tracking service
		const auth_response = authenticateStep();

		// Step 4: Fetch express info for the tracking number
		const express_info = fetchExpressInfoStep({
			order_data,
			auth_response,
		});

		const last_current_status = transform(
			{ express_info },
			({ express_info }) => {
				return express_info?.data?.expressList?.[0]?.currentScanType || 'Sign';
			},
		);

		// Step 5: Conditional logic - Create or Update fulfillment tracking
		const create_result = when(
			has_existing_tracking,
			(has_existing) => !has_existing,
		).then(() => {
			return createFulfillmentTrackingStep({
				current_status: last_current_status,
				express_info,
			});
		});

		const update_result = when(
			has_existing_tracking,
			(has_existing) => has_existing,
		).then(() => {
			return updateFulfillmentTrackingStep({
				current_status: last_current_status,
				order_data,
				express_info,
			});
		});

		// Step 6: Get the fulfillment tracking result (either created or updated)
		const fulfillment_tracking = transform(
			{ create_result, update_result },
			({ create_result, update_result }) => {
				return create_result || update_result;
			},
		);

		// Step 7: Link fulfillment and tracking (only if we created new tracking)
		when(has_existing_tracking, (has_existing) => !has_existing).then(() => {
			return linkFulfillmentTrackingStep({
				order_data: order_data,
				fulfillment_tracking,
			});
		});

		return new WorkflowResponse({
			message: transform(
				{ has_existing_tracking },
				({ has_existing_tracking }) =>
					has_existing_tracking
						? 'Fulfillment tracking updated successfully'
						: 'Fulfillment tracking created and linked successfully',
			),
			fulfillment_tracking,
		});
	},
);

export default upsertFulfillmentTrackingWorkflow;
