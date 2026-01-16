import type { IProductModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';

type ProductInfoInput = {
	inventoryItem: {
		id: string;
		sku: string;
	} | null;
};

export const getProductInfoStep = createStep(
	'get-product-info',
	async ({ inventoryItem }: ProductInfoInput, { container }) => {
		if (!inventoryItem) {
			return new StepResponse({
				success: false,
				variants: [],
				productId: null,
				productTitle: null,
			});
		}

		const productModuleService: IProductModuleService = container.resolve(
			Modules.PRODUCT,
		);

		// Find product variants with matching SKU
		const variants = await productModuleService.listProductVariants(
			{
				sku: inventoryItem.sku,
			},
			{
				take: 1,
			},
		);

		if (!variants.length) {
			return new StepResponse({
				success: false,
				variants: [],
				productId: null,
				productTitle: null,
			});
		}

		const productId = variants[0]?.product_id;

		if (!productId) {
			return new StepResponse({
				success: false,
				variants,
				productId: null,
				productTitle: null,
			});
		}

		// Find product name by product id
		const product = await productModuleService.retrieveProduct(productId);

		return new StepResponse({
			success: true,
			variants,
			productId,
			productTitle: product.title,
		});
	},
);
