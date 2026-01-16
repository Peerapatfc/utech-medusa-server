import type {
	MedusaRequest,
	MedusaResponse,
	AuthContext,
} from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

interface CustomMedusaRequest extends MedusaRequest {
	auth_context: AuthContext;
}

export const GET = async (req: CustomMedusaRequest, res: MedusaResponse) => {
	try {
		const priceSetIds = req.query.ids as string;
		const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
		const { data: priceSetCustoms } = await query.graph({
			entity: 'price_set',
			fields: ['*'],
			filters: {
				id: priceSetIds.split(','),
			},
			pagination: {
				take: 9999,
				skip: 0,
			},
		});
		const { data: productVariantPriceSets } = await query.graph({
			entity: 'product_variant_price_set',
			fields: ['*'],
			filters: {
				price_set_id: priceSetIds.split(','),
			},
			pagination: {
				take: 9999,
				skip: 0,
			},
		});
		const result = [];
		priceSetCustoms.map((priceSetCustom) => {
			const variant = productVariantPriceSets.filter(
				(productVariantPriceSet) =>
					productVariantPriceSet.price_set_id === priceSetCustom.id,
			)[0];
			result.push({
				...priceSetCustom,
				variant_price_set: variant,
			});
		});

		res.json({
			result,
		});
	} catch (err) {
		res.status(400).json({
			message: err.message,
		});
	}
};
