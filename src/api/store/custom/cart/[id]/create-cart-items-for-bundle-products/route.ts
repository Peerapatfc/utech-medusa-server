import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import type {
	CreateLineItemForCartDTO,
	ICartModuleService,
	IProductModuleService,
} from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
	const { id } = req.params;
	const body = req.body ?? [];
	const productModuleService: IProductModuleService = req.scope.resolve(Modules.PRODUCT)
	const cartService: ICartModuleService = req.scope.resolve(Modules.CART);
	const cart = await cartService.retrieveCart(id, {
		relations: ['items']
	});
	if (!cart.metadata?.is_pre_order) {
		return res.status(200).json({
			message: ""
		});
	}

	if (cart && Array.isArray(body) && body.length > 0) {
		const products: CreateLineItemForCartDTO[] = []
		const cartItems = cart.items ?? []
		for await (const product of body) {
			const hasItem = cartItems.filter((item) => item.variant_id === product.variantId).length > 0
			if (!hasItem) {
				const variant = await productModuleService.retrieveProductVariant(product.variantId, {
					relations: ['product']
				})
				products.push({
					cart_id: id,
					title: variant.title,
					variant_id: variant.id,
					product_id: product.productId,
					product_title: variant.product.title,
					quantity: 1,
					unit_price: product.price,
					metadata: {
						selectType: product.selectType,
						type: ['select_one', 'multiple_select'].includes(product.selectType) ? 'bundle' : 'premium',
					}
				})
			}
		}
		await cartService.addLineItems(products)
	}

	return res.status(200).json({
		message: ""
	});
};
