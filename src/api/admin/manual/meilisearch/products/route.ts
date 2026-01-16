import type { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import type {
	IProductModuleService,
	RemoteQueryFilters,
} from '@medusajs/framework/types';
import {
	ContainerRegistrationKeys,
	Modules,
	ProductStatus,
} from '@medusajs/framework/utils';
import type ProductMeiliSearchModuleService from '../../../../../modules/meilisearch/product-meilisearch/service';
import { PRODUCT_MEILISEARCH_MODULE } from '../../../../../modules/meilisearch/product-meilisearch';
import syncProductMeilisearchWorkflowV2 from '../../../../../workflows/product/sync-meilisearch-v2';

export async function POST(req: MedusaRequest, res: MedusaResponse) {
	const productService: IProductModuleService = req.scope.resolve(
		Modules.PRODUCT,
	);
	const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
	const productMeiliSearchModuleService: ProductMeiliSearchModuleService =
		req.scope.resolve(PRODUCT_MEILISEARCH_MODULE);

	const serviceProductType = await productService
		.listProductTypes({})
		.then((productTypes) => {
			return productTypes.find(
				(productType) => productType.value.toLocaleLowerCase() === 'service',
			);
		});

	const unusedProducts = await productService.listProducts(
		{
			$or: [
				{
					status: [
						ProductStatus.DRAFT,
						ProductStatus.PROPOSED,
						ProductStatus.REJECTED,
					],
				},
				{
					type_id: serviceProductType?.id,
				},
				{
					deleted_at: { $ne: null },
				},
			],
		},
		{
			select: ['id', 'type_id', 'deleted_at'],
			withDeleted: true,
		},
	);

	if (unusedProducts.length > 0) {
		const unusedProductIds = unusedProducts.map((product) => product.id);
		await productMeiliSearchModuleService.deleteDocuments(unusedProductIds);
	}

	const filters = {
		status: 'published',
	} as RemoteQueryFilters<'product'>;

	const { data: products } = await query.graph({
		entity: 'product',
		fields: ['id', 'type_id'],
		filters,
		pagination: {
			take: 2000,
			skip: 0,
		},
	});

	const nonServiceProducts = products.filter(
		(product) => product.type_id !== serviceProductType?.id,
	);
	const productIds = nonServiceProducts.map((product) => product.id);

	await syncProductMeilisearchWorkflowV2(req.scope).run({
		input: {
			productIds,
		},
	});

	res.json({
		status: 'ok',
	});
}
