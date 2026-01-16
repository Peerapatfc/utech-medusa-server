import {
	createWorkflow,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import generateRunningNoWorkflow from '../generate-running-no';
import { RunningNumberConfigType } from '../../../types/running-number-config';
import getOrderByPaymentStep from './steps/get-order-by-payment-step';
import updateOrderRefundedMetadataStep from './steps/update-order-metadata.step';

export type OrderRefundedWorkflowInput = {
	paymentId: string;
};

export const THREE_DAYS = 60 * 60 * 24 * 3;
export const orderRefundedWorkflowId = 'order-refunded-workflow';

const orderRefundedWorkflow = createWorkflow(
	{
		name: orderRefundedWorkflowId,
		store: true,
		idempotent: true,
		retentionTime: THREE_DAYS,
	},
	(input: OrderRefundedWorkflowInput) => {
		const { order } = getOrderByPaymentStep({
			paymentId: input.paymentId,
		});

		const { generatedNo: generatedCreditNoteNo } =
			generateRunningNoWorkflow.runAsStep({
				input: {
					type: RunningNumberConfigType.CREDIT_NOTE_NO,
				},
			});

		updateOrderRefundedMetadataStep({
			orderId: order.id,
			generatedCreditNoteNo,
		});

		return new WorkflowResponse({
			order,
			generatedCreditNoteNo,
		});
	},
);

export default orderRefundedWorkflow;
