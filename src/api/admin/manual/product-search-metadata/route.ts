import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type { IProductModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import updateProductSearchMetadataWorkflow from '../../../../workflows/product/update-product-search-metadata';

export const POST = async (
	req: MedusaRequest<{
		offset: number;
		limit: number;
	}>,
	res: MedusaResponse,
) => {
	const productService: IProductModuleService = req.scope.resolve(
		Modules.PRODUCT,
	);

	const { offset = 0, limit = 200 } = req.body;

	const products = await productService.listProducts(
		{},
		{
			take: limit,
			skip: offset,
			order: {
				created_at: 'ASC',
			},
		},
	);

	const productsIds = products.map((product) => product.id);

	await updateProductSearchMetadataWorkflow(req.scope).run({
		input: {
			// productId: ['prod_01JMEPVFED03TNE3N928BN5BFF'],
			productId: productsIds,
		},
	});

	res.status(200).json({
		success: true,
	});
};
