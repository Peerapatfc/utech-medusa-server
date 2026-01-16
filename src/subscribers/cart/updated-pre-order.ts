import type { SubscriberArgs, SubscriberConfig } from '@medusajs/framework';
import type { ICartModuleService } from '@medusajs/framework/types';
import {
	CartWorkflowEvents,
	ContainerRegistrationKeys,
	Modules,
} from '@medusajs/framework/utils';
import { PRE_ORDER_SERVICE } from '../../modules/pre-order';
import type PreOrderService from '../..//modules/pre-order/service';

export default async function preOrderUpdatedHandler({
	event: { data },
	container,
}: SubscriberArgs<{ id: string }>) {
	const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
	const cartService: ICartModuleService = container.resolve(Modules.CART);
	const cart = await cartService.retrieveCart(data.id, {
		relations: ['items'],
	});
	logger.info('CartWorkflowEvents.CUSTOMER_UPDATED');

	const isPreOrder = cart.metadata?.is_pre_order;
	if (!isPreOrder) return;

	const preOrderProduct = cart.items.find(
		(item) =>
			item.product_type && item.product_type.toLowerCase() === 'pre-order',
	);
	if (!preOrderProduct) {
		logger.error('No pre-order product found in cart');
		return;
	}
	const productId = preOrderProduct.product_id;
	if (!productId) return;

	const preOrderService: PreOrderService = container.resolve(PRE_ORDER_SERVICE);
	const preOrderItemMapping = await preOrderService
		.listPreOrderTemplateItems({
			product_id: productId,
		})
		.then((res) => res[0]);
	const templateId = preOrderItemMapping?.pre_order_template_id;
	if (!templateId) {
		logger.error('No pre-order template found for product');
		return;
	}

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const preOrderMetadata: Record<string, any> = cart.metadata?.pre_order || {};
	await cartService.updateCarts(cart.id, {
		metadata: {
			pre_order: {
				...preOrderMetadata,
				pre_order_template_id: templateId,
			},
		},
	});
}

export const config: SubscriberConfig = {
	event: CartWorkflowEvents.UPDATED,
};
