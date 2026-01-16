import {
	createWorkflow,
	WorkflowResponse,
	transform,
	when,
} from '@medusajs/framework/workflows-sdk';
import {
	updateLineItemsStep,
	useRemoteQueryStep,
} from '@medusajs/medusa/core-flows';
import {
	cartFieldsForRefreshSteps,
	productVariantsFields,
} from '../../../../utils/cart/fields';
import preparePreOrderLineItemStep from './steps/prepare-line-item-step';

export const THREE_DAYS = 60 * 60 * 24 * 3;
export const updatePreOrderCartWorkflowId = 'update-pre-order-cart';

const updatePreOrderCartWorkflow = createWorkflow(
	{
		name: updatePreOrderCartWorkflowId,
		store: true,
		idempotent: true,
		retentionTime: THREE_DAYS,
	},
	(input: { cart_id: string }) => {
		const cart = useRemoteQueryStep({
			entry_point: 'cart',
			fields: cartFieldsForRefreshSteps,
			variables: { id: input.cart_id },
			list: false,
		});

		const variantIds = transform({ cart }, (data) => {
			return (data.cart.items ?? []).map((i) => i.variant_id);
		});

		const pricingContext = transform(
			{ cart },
			({ cart: { currency_code, region_id, customer_id } }) => {
				return {
					currency_code,
					region_id,
					customer_id,
				};
			},
		);

		const variants = useRemoteQueryStep({
			entry_point: 'variants',
			fields: productVariantsFields,
			variables: {
				id: variantIds,
				calculated_price: {
					context: pricingContext,
				},
			},
			throw_if_key_not_found: true,
		}).config({ name: 'fetch-variants' });

		const preparedLineItem = preparePreOrderLineItemStep({
			cart,
			variants,
		});

		const items = when(preparedLineItem, (preparedLineItem) => {
			return preparedLineItem.isOverideUnitPrice;
		}).then(() => {
			const updatedItems = updateLineItemsStep({
				id: cart.id,
				items: preparedLineItem.items,
			});

			return updatedItems;
		});

		return new WorkflowResponse({
			items,
		});
	},
);

export default updatePreOrderCartWorkflow;
