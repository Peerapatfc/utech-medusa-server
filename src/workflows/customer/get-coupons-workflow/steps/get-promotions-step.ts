import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type { PromotionDTO } from '@medusajs/framework/types';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

export const getPromotionsStep = createStep(
	'get-promotions',
	async ({ couponIds }: { couponIds: string[] }, { container }) => {
		if (!Array.isArray(couponIds) || couponIds.length === 0) {
			return new StepResponse([]);
		}

		const query = container.resolve(ContainerRegistrationKeys.QUERY);

		const now = new Date();
		const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

		const { data: promotions } = await query.graph({
			entity: 'promotion',
			fields: ['*', 'promotion_detail.*', 'campaign.*', 'application_method.*'],
			filters: {
				id: couponIds,
				//@ts-ignore
				$or: [
					{
						campaign: {
							ends_at: null,
						},
					},
					{
						campaign: {
							ends_at: {
								$gte: sevenDaysAgo.toISOString(),
							},
						},
					},
				],
			},
			pagination: {
				take: 5000,
				skip: 0,
			},
		});

		return new StepResponse(promotions as PromotionDTO[]);
	},
);
