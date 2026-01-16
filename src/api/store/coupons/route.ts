import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import getPromotionListWorkflow from '../../../workflows/promotion/get-promotion-list-workflow';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const { limit = '20', offset = '0', q = '' } = req.query;
	const limitInt = Number.parseInt(limit as string);
	const offsetInt = Number.parseInt(offset as string);
	const search = q as string;

	const { result } = await getPromotionListWorkflow(req.scope).run({
		input: {
			limit: limitInt,
			offset: offsetInt,
			is_new_customers: false,
			q: search,
		},
	});

	const { coupons, count } = result;

	res.status(200).json({
		coupons,
		count,
		offset: offsetInt,
		limit: limitInt,
	});
};
