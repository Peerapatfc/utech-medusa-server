import type {
	MedusaResponse,
	AuthenticatedMedusaRequest,
} from '@medusajs/framework/http';
import type { IProductModuleService } from '@medusajs/framework/types';
import { Modules, ProductStatus } from '@medusajs/framework/utils';
import type ProductMeiliSearchModuleService from '../../../../../../modules/meilisearch/product-meilisearch/service';
import { PRODUCT_MEILISEARCH_MODULE } from '../../../../../../modules/meilisearch/product-meilisearch';
import updateProductSearchMetadataWorkflow from '../../../../../../workflows/product/update-product-search-metadata';
import syncProductMeilisearchWorkflowV2 from '../../../../../../workflows/product/sync-meilisearch-v2';

export const PATCH = async (
	req: AuthenticatedMedusaRequest,
	res: MedusaResponse,
) => {
	const productService: IProductModuleService = req.scope.resolve(
		Modules.PRODUCT,
	);
	const productMeiliSearchModuleService: ProductMeiliSearchModuleService =
		req.scope.resolve(PRODUCT_MEILISEARCH_MODULE);

	const product = await productService.retrieveProduct(req.params.id);
	const serviceProductType = await productService
		.listProductTypes({})
		.then((productTypes) => {
			return productTypes.find(
				(productType) => productType.value.toLocaleLowerCase() === 'service',
			);
		});

	const isUnpublished = [
		ProductStatus.DRAFT,
		ProductStatus.PROPOSED,
		ProductStatus.REJECTED,
	].includes(product.status as ProductStatus);
	const isServiceProduct =
		serviceProductType && serviceProductType?.id === product.type_id;

	if (isUnpublished || isServiceProduct) {
		await productMeiliSearchModuleService.delete(product.id);
		res.status(200).json({ status: 'ok' });
		return;
	}

	await syncProductMeilisearchWorkflowV2(req.scope).run({
		input: {
			productIds: [product.id],
		},
	});

	await updateProductSearchMetadataWorkflow(req.scope).run({
		input: {
			productId: [product.id],
		},
	});

	res.status(200).json({ status: 'ok' });
};
