import type {
	MedusaResponse,
	AuthenticatedMedusaRequest,
} from '@medusajs/framework';
import { getCustomerCouponsWorkflow } from '../../../../workflows/customer/get-coupons-workflow';

export const GET = async (
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
) => {
	const { limit = '20', offset = '0', tab = 'all', search = '' } = req.query;
	const customerId = req.auth_context.actor_id;

	try {
		const { result } = await getCustomerCouponsWorkflow(req.scope).run({
			input: {
				customerId,
				limit: Number(limit),
				offset: Number(offset),
				tab: tab as 'all' | 'used' | 'expired',
				search: search as string,
			},
		});

		res.status(200).json(result);
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: error?.message || 'An error occurred',
		});
	}
};
