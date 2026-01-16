import { StepResponse, createStep } from '@medusajs/workflows-sdk';
import { CouponStatus } from '../../../types/promotion';
import type { Promotion, PromotionWorkflowContext } from '../types';

const sortPromotionsStep = createStep(
	'sort-promotions',
	async ({
		promotions,
		cart_subtotal,
		cart,
		cart_id,
	}: PromotionWorkflowContext) => {
		const dateCache = new Map<string, number>();
		const getEndTime = (date: string | null): number => {
			if (!date) return Number.POSITIVE_INFINITY;
			if (!dateCache.has(date)) {
				dateCache.set(date, new Date(date).getTime());
			}
			return dateCache.get(date);
		};

		const comparePromotions = (a: Promotion, b: Promotion) => {
			if (a.coupon_status !== b.coupon_status) {
				return a.coupon_status === CouponStatus.USE ? -1 : 1;
			}

			const aEndsAt = a.campaign?.ends_at;
			const bEndsAt = b.campaign?.ends_at;

			if (!aEndsAt !== !bEndsAt) return !aEndsAt ? 1 : -1;
			if (!aEndsAt && !bEndsAt) return 0;

			return (
				getEndTime(aEndsAt as unknown as string) -
				getEndTime(bEndsAt as unknown as string)
			);
		};

		const dateEndSortedPromotions = [...promotions].sort(comparePromotions);
		const discountSortedPromotions = [...dateEndSortedPromotions].sort(
			(a, b) => b.discount_value - a.discount_value,
		);

		return new StepResponse(
			{
				promotions: discountSortedPromotions,
				cart_subtotal,
				cart,
				cart_id,
			},
			{
				previousData: {},
			},
		);
	},
);

export default sortPromotionsStep;
