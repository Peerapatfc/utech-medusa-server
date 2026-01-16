import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import { Modules } from '@medusajs/framework/utils';
import { ProductBestSellersWorkflow } from '../../../../../../workflows/product/best-sellers-workflow';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const product_id = req.params.id;
	const limit = Number(req.query.limit ?? 20);
	const productService = req.scope.resolve(Modules.PRODUCT);

	const product = await productService.retrieveProduct(product_id);
	if (!product) {
		return res.status(404).json({
			success: false,
			message: 'Product not found',
		});
	}

	const { result } = await ProductBestSellersWorkflow(req.scope).run({
		input: {
			product_ids: [product_id],
			limit,
		},
	});
	const { products = [] } = result;
	const bestSellers = products.map((item) => item.product_id);

	return res.status(200).json({
		best_sellers: bestSellers,
		products,
	});
};
