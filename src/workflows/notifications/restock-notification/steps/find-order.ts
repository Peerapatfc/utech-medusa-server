import type {
	IOrderModuleService,
	IProductModuleService,
} from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import type { OrderItem } from '../types';

type FindOrderInput = {
	orderId: string;
};

export const findOrderStep = createStep(
	'find-order-information',
	async ({ orderId }: FindOrderInput, { container, context }) => {
		// Get order information
		const orderService: IOrderModuleService = container.resolve(Modules.ORDER);
		const productModuleService: IProductModuleService = container.resolve(
			Modules.PRODUCT,
		);
		const order = await orderService.retrieveOrder(orderId, {
			relations: ['items'],
		});

		const variants = await productModuleService.listProductVariants({
			sku: order.items.map((item) => item.variant_sku),
		});

		return new StepResponse({
			orderItems: order.items as OrderItem[],
			variants,
		});
	},
);
