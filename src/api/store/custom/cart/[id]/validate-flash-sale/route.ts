import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import validateCartFlashSaleWorkflow from '../../../../../../workflows/cart/validate-cart-flash-sale';
import { MedusaError } from '@medusajs/framework/utils';

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
	const cartId = req.params.id;

	try {
		const { result } = await validateCartFlashSaleWorkflow(req.scope).run({
			input: {
				cartId,
			},
		});

		res.status(200).json(result);
	} catch (error) {
		return res.status(500).json({
			message: error.message,
		});

		// throw new MedusaError(
		// 	MedusaError.Types.NOT_FOUND,
		// 	`API Key with id: ${req.params.id} was not found`,
		// );
	}
};
