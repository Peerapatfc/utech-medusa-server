import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import type ProductStrapiService from '../../../../modules/strapi/product/service';
import { PRODUCT_STRAPI_MODULE } from '../../../../modules/strapi/product';

const deleteProductInStrapiStep = createStep(
	'delete-product-in-strapi-step',
	async (input: { id: string }, { container }) => {
		const productStrapiService: ProductStrapiService = container.resolve(
			PRODUCT_STRAPI_MODULE,
		);

		await productStrapiService.deleteProductByMedusaId(input.id);

		return new StepResponse(input);
	},
);

export default deleteProductInStrapiStep;
