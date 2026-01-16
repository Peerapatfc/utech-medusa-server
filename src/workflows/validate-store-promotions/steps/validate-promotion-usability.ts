import type {
	ICustomerModuleService,
	IPromotionModuleService,
} from "@medusajs/framework/types";
import {
	ComputedActions,
	Modules,
	PromotionActions,
} from "@medusajs/framework/utils";
import { StepResponse, createStep } from "@medusajs/workflows-sdk";
import { CouponStatus } from "../../../types/promotion";
import checkCouponUsabilityWorkflow from "../../check-coupon-usability";
import type { PromotionWorkflowContext } from "../types";
import { CustomerGroupName } from "../../../types/customer-group";

type ValidationWorkflowResult = {
	result?: {
		actions?: Array<{ action: string }>;
	};
};

const validatePromotionUsabilityStep = createStep(
	"validate-promotion-usability",
	async (
		{ promotions, cart_subtotal, cart, cart_id }: PromotionWorkflowContext,
		context,
	) => {
		const promotionService = context.container.resolve<IPromotionModuleService>(
			Modules.PROMOTION,
		);

		const customer_id = cart?.customer_id;
		let is_new_customer = false;
		let collect_coupons: string[] = [];
		if (customer_id) {
			const customerService: ICustomerModuleService = context.container.resolve(
				Modules.CUSTOMER,
			);
			const customer = await customerService.retrieveCustomer(customer_id, {
				relations: ["id", "groups", "metadata"],
			});
			is_new_customer = customer.groups.some(
				(group) => group.name === CustomerGroupName.NEW_MEMBER,
			);
			const coupon_ids = (customer.metadata?.coupon_ids as string[]) ?? [];
			collect_coupons = coupon_ids ?? [];
		}

		const validatedPromotions = await Promise.all(
			promotions.map(async (promotion) => {
				try {
					const promotionDetail = await promotionService.retrievePromotion(
						promotion.id,
						{
							relations: ["application_method.target_type"],
						},
					);

					const workflowResult = (await checkCouponUsabilityWorkflow(
						context.container,
					).run({
						input: {
							cart_id,
							promo_codes: [promotion.code],
							action: PromotionActions.REPLACE,
						},
					})) as ValidationWorkflowResult;

					const actions = workflowResult?.result?.actions || [];
					const discount_value = actions
						.filter(
							(action) =>
								action.action === ComputedActions.ADD_ITEM_ADJUSTMENT ||
								action.action ===
									ComputedActions.ADD_SHIPPING_METHOD_ADJUSTMENT,
						)
						.reduce(
							// @ts-ignore
							(sum, compute) => sum + (compute.amount ?? 0),
							0,
						);
					promotion.discount_value = discount_value;
					promotion.is_collected = collect_coupons.some(
						(coupon_id: string) => coupon_id === promotion.id,
					);

					const actionSet = new Set(actions.map((a) => a.action));
					promotion.coupon_status =
						promotion.discount_value > 0 &&
						(actionSet.has(ComputedActions.ADD_ITEM_ADJUSTMENT) ||
							actionSet.has(ComputedActions.ADD_SHIPPING_METHOD_ADJUSTMENT) ||
							promotionDetail.application_method.target_type ===
								"shipping_methods")
							? CouponStatus.USE
							: CouponStatus.CANT_USE;

					if (
						promotion.promotion_detail.is_new_customer &&
						promotion.promotion_detail.is_new_customer !== is_new_customer
					) {
						promotion.coupon_status = CouponStatus.CANT_USE;
						promotion.discount_value = 0;
					}
					if (actionSet.has(ComputedActions.CAMPAIGN_BUDGET_EXCEEDED)) {
						promotion.usage_exceeded = true;
					}
				} catch (error) {
					// Log error for debugging if needed
					// console.error(`Error validating promotion ${promotion.code}:`, error);
					promotion.coupon_status = CouponStatus.CANT_USE;
				}
				return promotion;
			}),
		);

		return new StepResponse(
			{
				promotions: validatedPromotions,
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

export default validatePromotionUsabilityStep;
