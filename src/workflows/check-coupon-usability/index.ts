import { PromotionActions } from '@medusajs/framework/utils';
import {
	type WorkflowData,
	WorkflowResponse,
	createWorkflow,
	transform,
} from '@medusajs/framework/workflows-sdk';
import {
	getActionsToComputeFromPromotionsStep,
	getPromotionCodesToApply,
	useRemoteQueryStep,
} from '@medusajs/medusa/core-flows';
import type { UpdateCartPromotionsWorkflowInput } from '@medusajs/medusa/core-flows';
import { cartFieldsForRefreshSteps } from '../../utils/cart/fields';

export const checkCouponUsabilityWorkflowId = 'check-coupon-usability';

const getCart = (cartId: string) =>
	useRemoteQueryStep({
		entry_point: 'cart',
		fields: cartFieldsForRefreshSteps,
		variables: { id: cartId },
		list: false,
	});

const getPromoCodes = (
	input: WorkflowData<UpdateCartPromotionsWorkflowInput>,
) => transform({ input }, (data) => (data.input.promo_codes || []) as string[]);

const getAction = (input: WorkflowData<UpdateCartPromotionsWorkflowInput>) =>
	transform({ input }, (data) => data.input.action || PromotionActions.ADD);

const checkCouponUsabilityWorkflow = createWorkflow(
	checkCouponUsabilityWorkflowId,
	(
		input: WorkflowData<UpdateCartPromotionsWorkflowInput>,
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	): WorkflowData<any> => {
		const cart = getCart(input.cart_id);
		const promoCodes = getPromoCodes(input);
		const action = getAction(input);

		const promotionCodesToApply = getPromotionCodesToApply({
			cart,
			promo_codes: promoCodes,
			action: action as PromotionActions,
		});

		const actions = getActionsToComputeFromPromotionsStep({
			cart,
			promotionCodesToApply,
		});

		return new WorkflowResponse({ actions });
	},
);

export default checkCouponUsabilityWorkflow;
