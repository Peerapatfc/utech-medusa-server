import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type { IPromotionModuleService } from '@medusajs/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/utils';

export async function GET(
	req: MedusaRequest,
	res: MedusaResponse,
): Promise<void> {
	const id = req.params.id;
	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
	const { data: promotions } = await query.graph({
		entity: 'promotion',
		fields: ['*', 'promotion_detail.*', 'campaign.*', 'application_method.*'],
		filters: {
			id: id,
		},
		pagination: {
			take: 1,
			skip: 0,
		},
	});

	res.json({
		promotion: promotions[0],
	});
}
