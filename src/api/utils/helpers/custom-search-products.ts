import type {
	AuthenticatedMedusaRequest,
	MedusaNextFunction,
	MedusaResponse,
} from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
export const customSearchProduct = async (
	req: AuthenticatedMedusaRequest,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	const q = req.query.q as string | undefined;
	if (!q) {
		return next();
	}

	const skus = q
		.split(',')
		.map((sku) => sku.trim())
		.filter((sku) => sku.length > 0);

	if (skus.length === 0) {
		return next();
	}

	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

	const { data: products } = await query.graph({
		entity: 'product',
		fields: ['id'],
		filters: {
			//@ts-ignore
			$or: [
				{
					metadata: {
						sku: skus,
					},
				},
				{
					variants: {
						sku: skus,
					},
				},
				{
					handle: q,
				},
			],
		},
	});

	if (products.length > 0) {
		const productIds = products.map((product) => product.id);
		const { q, ...restOfFilterableFields } = req.filterableFields;
		req.filterableFields = {
			...restOfFilterableFields,
			id: productIds,
		};

		return next();
	}

	next();
};
