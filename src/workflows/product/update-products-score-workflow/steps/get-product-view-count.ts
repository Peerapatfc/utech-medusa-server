import type { IProductModuleService } from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';

export const getProductViewCountStep = createStep(
	'get-product-view-count',
	async ({ product_ids }: { product_ids: string[] }, { container }) => {
		const productService: IProductModuleService = container.resolve(
			Modules.PRODUCT,
		);

		const products = await productService.listProducts({
			id: product_ids,
		});

		const productViewCount = products.map((product) => ({
			id: product.id,
			viewCount: Number(product.metadata?.view) || 0,
		}));

		return new StepResponse({
			productViewCount,
		});
	},
);
