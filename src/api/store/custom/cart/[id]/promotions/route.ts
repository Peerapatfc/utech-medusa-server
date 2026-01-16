import type { MedusaRequest, MedusaResponse } from '@medusajs/framework';
import validateStorePromotionsWorkflow from '../../../../../../workflows/validate-store-promotions/validate-store-promotions.workflow';

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
	const { id: cartId } = req.params;
	const { code, validate_only } = req.query;

	if (!cartId) {
		return res.status(400).json({ message: 'Cart ID is required' });
	}

	try {
		const result = await validateStorePromotionsWorkflow(req.scope).run({
			input: {
				cart_id: cartId,
				promo_code: code as string,
				validate_only: validate_only === 'true',
			},
		});

		return res.status(200).json({ promotions: result.result });
	} catch (error) {
		return res.status(500).json({
			message: 'Internal server error',
			error: error instanceof Error ? error.message : 'Unknown error',
		});
	}
};
