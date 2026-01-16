import type { ICartModuleService } from '@medusajs/framework/types';
import { ContainerRegistrationKeys, Modules } from '@medusajs/framework/utils';
import { StepResponse, createStep } from '@medusajs/workflows-sdk';
import type { PromotionWorkflowInput } from '../types';

const getActivePromotionsStep = createStep(
	'get-active-promotions',
	async (input: PromotionWorkflowInput, context) => {
		const query = context.container.resolve(ContainerRegistrationKeys.QUERY);
		const cartService: ICartModuleService = context.container.resolve(
			Modules.CART,
		);
		const [cart, promotionsResponse] = await Promise.all([
			cartService.retrieveCart(input.cart_id, {
				select: ['id', 'total', 'subtotal', 'item_total', 'customer_id'],
			}),
			query.graph({
				entity: 'promotion',
				pagination: {
					take: 999,
					skip: 0,
					order: { campaign: { ends_at: 'ASC' } },
				},
				fields: [
					'id',
					'code',
					'campaign.name',
					'campaign.description',
					'campaign.starts_at',
					'campaign.ends_at',
					'promotion_detail.is_store_visible',
					'promotion_detail.custom_rules',
					'promotion_detail.is_new_customer',
					'promotion_detail.promotion_type',
					'application_method.*',
				],
				filters: input.promo_code
					? {
							//@ts-ignore
							$or: [
								{
									code: {
										$eq: String(input.promo_code),
									},
								},
								{
									campaign: {
										description: {
											$ilike: `%${String(input.promo_code)}%`,
										},
									},
								},
							],
							//@ts-ignore
							status: { $eq: 'active' },
						}
					: { status: { $eq: 'active' } },
			}),
		]);

		if (!cart || !promotionsResponse.data?.length) {
			return new StepResponse(
				{
					cart_subtotal: 0,
					promotions: [],
					cart_id: input.cart_id,
					cart: null,
				},
				{
					previousData: {},
				},
			);
		}

		const now = new Date().getTime();
		const activePromotions = promotionsResponse.data.filter((promo) => {
			const { campaign, promotion_detail, code } = promo;
			if (!campaign) {
				return false;
			}

			const startsAtTime = campaign.starts_at
				? new Date(campaign.starts_at).getTime()
				: null;
			const endsAtTime = campaign.ends_at
				? new Date(campaign.ends_at).getTime()
				: null;

			const isStartValid = !startsAtTime || startsAtTime <= now;
			const isEndValid = !endsAtTime || endsAtTime >= now;
			const isTimeValid = isStartValid && isEndValid;
			let is_store_visible = promotion_detail?.is_store_visible;
			if (code === input.promo_code) {
				is_store_visible = true;
			}

			return isTimeValid && is_store_visible === true;
		});

		const response = {
			cart_subtotal: Number(cart.subtotal) || 0,
			promotions: activePromotions,
			cart: cart,
			cart_id: input.cart_id,
		};

		return new StepResponse(response, {
			previousData: {},
		});
	},
);

export default getActivePromotionsStep;
