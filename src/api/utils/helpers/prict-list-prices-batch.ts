import type {
	AuthenticatedMedusaRequest,
	MedusaNextFunction,
	MedusaResponse,
} from '@medusajs/framework/http';
import type {
	BatchMethodRequest,
	IProductModuleService,
} from '@medusajs/framework/types';
import type {
	AdminCreatePriceListPriceType,
	AdminUpdatePriceListPriceType,
} from '@medusajs/medusa/api/admin/price-lists/validators';
import { Modules } from '@medusajs/framework/utils';
import updateProductSearchMetadataWorkflow from '../../../workflows/product/update-product-search-metadata';

export const priceListPricesBatch = async (
	req: AuthenticatedMedusaRequest<
		BatchMethodRequest<
			AdminCreatePriceListPriceType,
			AdminUpdatePriceListPriceType
		>
	>,
	_res: MedusaResponse,
	next: MedusaNextFunction,
) => {
	const productService: IProductModuleService = req.scope.resolve(
		Modules.PRODUCT,
	);
	const { body } = req;

	try {
		const variantIds = [];
		for await (const priceListPriceCreate of body.create) {
			const { variant_id } = priceListPriceCreate;
			variantIds.push(variant_id);
		}

		for await (const priceListPriceUpdate of body.update) {
			const { variant_id } = priceListPriceUpdate;
			variantIds.push(variant_id);
		}

		const variants = await productService.listProductVariants({
			id: variantIds,
		});

		const productIds = variants.map((v) => v.product_id);
		if (productIds.length > 0) {
			// timeout 10 seconds to perform the update
			setTimeout(() => {
				updateProductSearchMetadataWorkflow(req.scope).run({
					input: {
						productId: productIds,
					},
				});
			}, 10000);
		}
	} catch (e) {}
	next();
};
