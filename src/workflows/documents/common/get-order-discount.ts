import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import {
	createStep,
	type StepExecutionContext,
	StepResponse,
} from '@medusajs/framework/workflows-sdk';

const getOrderDiscountStep = createStep(
	'get-order-discount-step',
	async ({ order_id }: { order_id: string }, context: StepExecutionContext) => {
		const query = context.container.resolve(ContainerRegistrationKeys.QUERY);
		const { data: order_cart } = await query.graph({
			entity: 'order_cart',
			filters: {
				order_id,
			},
			fields: ['*', 'cart.promotions.*'],
			pagination: {
				take: 1,
				skip: 0,
			},
		});

		const promotionCode = order_cart?.[0]?.cart?.promotions?.[0]?.code;

		let discountTemplate = 'Discount';
		if (promotionCode) {
			discountTemplate += ` (code: ${promotionCode})`;
		}

		return new StepResponse({
			discountTemplate,
		});
	},
);

export default getOrderDiscountStep;
