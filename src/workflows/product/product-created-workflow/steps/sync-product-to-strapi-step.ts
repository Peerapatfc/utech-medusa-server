import type {
	AdminProduct,
	IProductModuleService,
	Logger,
} from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { StepResponse, createStep } from '@medusajs/framework/workflows-sdk';
import { PRODUCT_STRAPI_MODULE } from '../../../../modules/strapi/product';
import type ProductStrapiService from '../../../../modules/strapi/product/service';

const syncProductToStrapiStep = createStep(
	'sync-product-to-strapi-step',
	async (input: { product: AdminProduct }, { container }) => {
		const logger: Logger = container.resolve('logger');
		const { product } = input;
		const productService: IProductModuleService = container.resolve(
			Modules.PRODUCT,
		);
		const productStrapiService: ProductStrapiService = container.resolve(
			PRODUCT_STRAPI_MODULE,
		);

		try {
			const createdProductStrapi = await productStrapiService.createProduct({
				medusa_id: product.id,
				title: product.title,
				handle: product.handle,
			});
			if (createdProductStrapi) {
				await productService.updateProducts(product.id, {
					metadata: {
						...product.metadata,
						strapi_id: createdProductStrapi.id,
					},
				});
			}

			return new StepResponse(createdProductStrapi, {
				strapiProduct: createdProductStrapi,
			});
		} catch (error) {
			logger.error(`Error syncing product to Strapi: ${error?.message}`);
			return new StepResponse(null, { strapiProduct: null });
		}
	},
	async (input, { container }) => {
		const productStrapiService: ProductStrapiService = container.resolve(
			PRODUCT_STRAPI_MODULE,
		);

		await productStrapiService.deleteProduct(input.strapiProduct.id);
	},
);

export default syncProductToStrapiStep;
