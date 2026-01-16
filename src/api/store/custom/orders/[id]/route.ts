import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { getOrderDetailWorkflow } from '@medusajs/core-flows';
import { defaultAdminOrderFields } from '../../../../../utils/query-configs/order';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const orderId = req.params.id;
	const workflow = getOrderDetailWorkflow(req.scope);
	const { result } = await workflow.run({
		input: {
			fields: defaultAdminOrderFields,
			order_id: orderId,
		},
	});

	res.status(200).json({ order: result });
};
