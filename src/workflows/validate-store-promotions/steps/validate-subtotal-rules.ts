import { StepResponse, createStep } from '@medusajs/workflows-sdk';
import { CouponStatus } from '../../../types/promotion';
import type { PromotionWorkflowContext } from '../types';

const subtotalOperators = {
	lt: (value: number, cartSubtotal: number) => cartSubtotal < value,
	gt: (value: number, cartSubtotal: number) => cartSubtotal > value,
	gte: (value: number, cartSubtotal: number) => cartSubtotal >= value,
	lte: (value: number, cartSubtotal: number) => cartSubtotal <= value,
} as const;

type OperatorKey = keyof typeof subtotalOperators;

const validateSubtotalRulesStep = createStep(
	'validate-subtotal-rules',
	async (
		{ promotions, cart_subtotal, cart, cart_id }: PromotionWorkflowContext,
		context,
	) => {
		const validatedPromotions = promotions.map((promotion) => {
			const customRules = promotion.promotion_detail?.custom_rules;
			const subtotalRules = customRules?.subtotal;

			if (!subtotalRules) return promotion;

			const isValid = Object.entries(subtotalOperators).some(
				([op, fn]) =>
					op in subtotalRules &&
					fn(subtotalRules[op as OperatorKey], cart_subtotal),
			);

			if (!isValid) {
				promotion.coupon_status = CouponStatus.CANT_USE;
			}

			return promotion;
		});

		return new StepResponse(
			{
				promotions: validatedPromotions,
				cart_subtotal,
				cart,
				cart_id: cart_id,
			},
			{
				previousData: {},
			},
		);
	},
);

export default validateSubtotalRulesStep;
