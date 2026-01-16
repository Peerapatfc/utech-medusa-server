import {
	createWorkflow,
	WorkflowResponse,
} from '@medusajs/framework/workflows-sdk';
import { _2c2pPaymentInquiryStep } from './steps/2c2p-payment-inquiry-step';

export type PaymentInquiryInput = {
	orderId: string;
};

const paymentInquiryWorkflow = createWorkflow(
	'payment-inquiry',
	(input: PaymentInquiryInput) => {
		const inquiry = _2c2pPaymentInquiryStep(input);

		return new WorkflowResponse({
			inquiry,
		});
	},
);

export default paymentInquiryWorkflow;
