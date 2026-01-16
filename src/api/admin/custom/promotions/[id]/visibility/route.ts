import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import type PromotionCustomModuleService from '../../../../../../modules/promotion-custom/service';
import { PROMOTION_CUSTOM_MODULE } from '../../../../../../modules/promotion-custom';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import { STOREFRONT_MODULE } from '../../../../../../modules/storefront';
import type StorefrontModuleService from '../../../../../../modules/storefront/service';

export const PATCH = async (
	req: MedusaRequest<{
		is_store_visible: boolean;
	}>,
	res: MedusaResponse,
) => {
	const { id } = req.params;

	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
	const promotionCustomService: PromotionCustomModuleService =
		req.scope.resolve(PROMOTION_CUSTOM_MODULE);
	const { data } = await query.graph({
		entity: 'promotion',
		fields: ['*', 'promotion_detail.*'],
		filters: {
			id,
		},
		pagination: {
			take: 1,
			skip: 0,
		},
	});

	const promotion = data[0];
	if (!promotion) {
		res.status(404).json({
			success: false,
			message: 'Promotion not found',
		});
		return;
	}

	if (!promotion?.promotion_detail) {
		const promotionDetail = await promotionCustomService.createPromotionDetails(
			{
				is_store_visible: req.body.is_store_visible,
			},
		);

		const link = req.scope.resolve(ContainerRegistrationKeys.LINK);
		await link.create({
			[Modules.PROMOTION]: {
				promotion_id: promotion.id,
			},
			[PROMOTION_CUSTOM_MODULE]: {
				promotion_detail_id: promotionDetail.id,
			},
		});

		res.status(200).json({
			success: true,
			message: 'Promotion visibility updated',
		});
		return;
	}

	try {
		await promotionCustomService.updatePromotionDetails({
			id: promotion.promotion_detail.id,
			is_store_visible: req.body.is_store_visible,
		});

		const storefrontService: StorefrontModuleService =
			req.scope.resolve(STOREFRONT_MODULE);
		storefrontService.revalidateTag('coupons');

		res.status(200).json({
			success: true,
			message: 'Promotion visibility updated',
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: 'Could not update promotion visibility',
			error: error.message,
		});
	}
};
