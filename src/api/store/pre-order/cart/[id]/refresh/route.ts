import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import { Modules } from '@medusajs/framework/utils';
import type { ICartModuleService } from '@medusajs/framework/types';
import updatePreOrderCartWorkflow from '../../../../../../workflows/order/pre-order/refresh-pre-order-cart';

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
	const cartId = req.params.id;

	const cartService: ICartModuleService = req.scope.resolve(Modules.CART);
	const cart = await cartService.retrieveCart(cartId);

	if (!cart.metadata?.is_pre_order) {
		res.status(200).json({
			success: false,
			message: 'Cart is not a pre-order cart',
		});
		return;
	}

	const { result } = await updatePreOrderCartWorkflow(req.scope).run({
		input: {
			cart_id: cartId,
		},
	});

	res.status(200).json({
		success: true,
		result,
	});
};
