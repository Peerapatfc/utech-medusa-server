import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const invoiceNo = req.params.invoice_id;

	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
	const { data } = await query.graph({
		entity: 'order',
		fields: ['*'],
		filters: {
			metadata: {
				payment_invoice_no: invoiceNo,
			},
		},
		pagination: {
			take: 1,
			skip: 0,
		},
	});

	res.json({
		order: data[0] || null,
	});
};
