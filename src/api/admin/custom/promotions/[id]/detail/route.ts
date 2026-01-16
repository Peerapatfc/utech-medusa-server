import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import type { IPromotionModuleService } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import { PROMOTION_CUSTOM_MODULE } from '../../../../../../modules/promotion-custom';
import type PromotionCustomModuleService from '../../../../../../modules/promotion-custom/service';
import { STOREFRONT_MODULE } from '../../../../../../modules/storefront';
import type StorefrontModuleService from '../../../../../../modules/storefront/service';
import {
	type PromotionCustomRule,
	PromotionType,
} from '../../../../../../types/promotion';

interface UpdatePromotionDetail {
	name: string;
	description: string;
	custom_rules: PromotionCustomRule;
	is_custom_rule: boolean;
	promotion_type: PromotionType;
	metadata: Record<string, unknown>;
}

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const { id } = req.params;

	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
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
		res.status(404).json({
			success: false,
			message: 'Promotion detail not found',
		});
		return;
	}

	res.status(200).json({
		success: true,
		message: '',
		promotion,
	});
};

export const PATCH = async (
	req: MedusaRequest<UpdatePromotionDetail>,
	res: MedusaResponse,
) => {
	const { id } = req.params;

	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
	const promotionCustomService: PromotionCustomModuleService =
		req.scope.resolve(PROMOTION_CUSTOM_MODULE);
	const promotionService: IPromotionModuleService = req.scope.resolve(
		Modules.PROMOTION,
	);
	const { data } = await query.graph({
		entity: 'promotion',
		fields: ['*', 'rules.*', 'rules.values.*', 'promotion_detail.*'],
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
		res.status(404).json({
			success: false,
			message: 'Promotion detail not found',
		});
		return;
	}

	try {
		if (req.body.is_custom_rule) {
			await promotionCustomService.updatePromotionDetails({
				id: promotion.promotion_detail.id,
				name: req.body.name,
				description: req.body.description,
				metadata: req.body.metadata,
				custom_rules: null,
			});
			await promotionCustomService.updatePromotionDetails({
				id: promotion.promotion_detail.id,
				custom_rules: req.body.custom_rules as unknown as Record<
					string,
					unknown
				>,
			});
		} else {
			await promotionCustomService.updatePromotionDetails({
				id: promotion.promotion_detail.id,
				name: req.body.name,
				description: req.body.description,
				promotion_type: req.body.promotion_type,
				metadata: req.body.metadata,
			});
		}

		if (req.body.promotion_type === PromotionType.SHIPPING) {
			await promotionService.updatePromotions({
				id: promotion.id,
				application_method: {
					target_type: 'shipping_methods',
					type: 'percentage',
					value: 100,
				},
			});
		} else if (req.body.promotion_type === PromotionType.DISCOUNT) {
			await promotionService.updatePromotions({
				id: promotion.id,
				application_method: {
					target_type: 'items',
				},
			});
		}

		const freshData = await query
			.graph({
				entity: 'promotion',
				fields: ['*', 'promotion_detail.*'],
				filters: {
					id,
				},
				pagination: {
					take: 1,
					skip: 0,
				},
			})
			.then((res) => res.data[0]);

		const storefrontService: StorefrontModuleService =
			req.scope.resolve(STOREFRONT_MODULE);
		storefrontService.revalidateTag('coupons');

		res.status(200).json({
			success: true,
			message: 'Promotion detail updated',
			data: freshData,
		});
	} catch (error) {
		res.status(400).json({
			success: false,
			message: 'Could not update promotion detail',
			error: error.message,
		});
	}
};
