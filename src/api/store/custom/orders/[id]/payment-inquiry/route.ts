import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import paymentInquiryWorkflow from '../../../../../../workflows/payment-inquiry';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const { id } = req.params;

	const {
		result: { inquiry },
	} = await paymentInquiryWorkflow(req.scope).run({
		input: {
			orderId: id,
		},
	});

	res.status(200).json({
		inquiry,
	});
};
