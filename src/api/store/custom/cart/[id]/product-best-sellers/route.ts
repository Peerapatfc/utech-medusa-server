import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import { Modules } from '@medusajs/framework/utils';
import { ProductBestSellersWorkflow } from '../../../../../../workflows/product/best-sellers-workflow';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const cart_id = req.params.id;
	const { limit = 8 } = req.query;

	const cartService = req.scope.resolve(Modules.CART);
	const cart = await cartService.retrieveCart(cart_id, {
		relations: ['items'],
	});
	if (!cart) {
		return res.status(200).json({
			best_sellers: [],
			products: [],
		});
	}

	const productIds = cart.items?.map((item) => item.product_id) || [];
	if (productIds.length === 0) {
		return res.status(200).json({
			best_sellers: [],
			products: [],
		});
	}

	const { result } = await ProductBestSellersWorkflow(req.scope).run({
		input: {
			product_ids: productIds,
			limit: limit as number,
		},
	});
	const { products = [] } = result;
	const bestSellers = products.map((item) => item.product_id);

	return res.status(200).json({
		best_sellers: bestSellers ?? [],
		products: products ?? [],
	});
};
