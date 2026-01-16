import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import { cancelOrderWorkflow } from '@medusajs/medusa/core-flows';
import { getOrderDetailWorkflow } from '@medusajs/medusa/core-flows';

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
	const { id } = req.params;

	const { result: order } = await getOrderDetailWorkflow(req.scope).run({
		input: {
			fields: ['id', 'payment_status'],
			order_id: id,
		},
	});

	if (order.payment_status === 'captured') {
		return res.status(400).json({
			message: 'Order cannot be cancelled',
		});
	}

	await cancelOrderWorkflow(req.scope).run({
		input: {
			order_id: id,
		},
	});

	res.status(200).json({
		message: 'Order cancelled successfully',
	});
};
