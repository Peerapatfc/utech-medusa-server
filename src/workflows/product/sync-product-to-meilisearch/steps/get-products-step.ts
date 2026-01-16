import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';
import { Modules } from '@medusajs/framework/utils';
import type {
	IProductModuleService,
	ProductDTO,
} from '@medusajs/framework/types';
import type { SyncProductMeiliSearchWorkflowInput } from '../index';
import { PRODUCT_ATTRIBUTE_MODULE } from '../../../../modules/product-attributes';
import type ProductAttributeService from '../../../../modules/product-attributes/service';

export interface AdditionalProperties {
	brand: string;
	sku: string | unknown;
}

export type ExtendedProductDTO = ProductDTO & AdditionalProperties;

const getProductsStep = createStep(
	'get-products-step',
	async (input: SyncProductMeiliSearchWorkflowInput, context) => {
		const productModuleService: IProductModuleService =
			context.container.resolve(Modules.PRODUCT);
		const attributeModuleService: ProductAttributeService =
			context.container.resolve(PRODUCT_ATTRIBUTE_MODULE);
		const products = (await productModuleService.listProducts(
			{
				id: input.productIds,
			},
			{
				relations: ['variants'],
			},
		)) as ExtendedProductDTO[];

		const [brand] = await attributeModuleService.listProductAttributes(
			{
				code: ['brand'],
			},
			{ take: 1, relations: ['options'] },
		);

		for await (const product of products) {
			Object.assign(product, {
				brand: '',
				sku: '',
			});

			if (product.metadata?.brand && brand?.options?.length) {
				product.brand =
					brand.options.find((o) => o.value === product.metadata.brand)
						?.title || '';
			}

			product.sku = product.metadata?.sku || '';
		}

		return new StepResponse(
			{
				products,
			},
			{
				previousData: {},
			},
		);
	},
);

export default getProductsStep;
