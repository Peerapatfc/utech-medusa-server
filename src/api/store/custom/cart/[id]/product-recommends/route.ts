import {
	AuthenticatedMedusaRequest,
	MedusaResponse,
} from '@medusajs/framework/http';
import productRecommendsWorkflow from '../../../../../../workflows/cart/product-recommends';

export const GET = async (
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
) => {
	const { id } = req.params;
	const { limit = 8 } = req.query;

	const { result } = await productRecommendsWorkflow(req.scope).run({
		input: {
			cartId: id,
			limit: limit as number,
		},
	});

	res.status(200).json({
		recommend_products: result.recommendedProducts || [],
	});
};
