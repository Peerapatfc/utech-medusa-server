import type {
	IProductModuleService,
	Logger,
	ProductDTO,
	ProductVariantDTO,
} from '@medusajs/framework/types';
import { Modules } from '@medusajs/framework/utils';
import { createStep, StepResponse } from '@medusajs/framework/workflows-sdk';

interface InputType {
	products: ProductDTO[];
}

const updateProductSearchMetadataStep = createStep(
	'update-product-search-metadata-step',
	async ({ products }: InputType, { container }) => {
		const logger: Logger = container.resolve('logger');

		const productService: IProductModuleService = container.resolve(
			Modules.PRODUCT,
		);

		for await (const product of products) {
			// @ts-ignore
			const inventoryQuantity = product.inventory_quantity || null;
			const minCalculatedPrice = getMinCalculatedPrice(product.variants);
			const maxCalculatedPrice = getMaxCalculatedPrice(product.variants);

			await productService.updateProducts(product.id, {
				metadata: {
					...product.metadata,
					inventory_quantity: inventoryQuantity,
					min_calculated_price: minCalculatedPrice,
					max_calculated_price: maxCalculatedPrice,
				},
			});

			logger.info(
				`Product with id ${product.id} updated with search metadata, inventory_quantity: ${inventoryQuantity}, min_calculated_price: ${minCalculatedPrice}`,
			);
		}

		return new StepResponse({
			message: 'Product search metadata updated',
		});
	},
);

const getMinCalculatedPrice = (variants: ProductVariantDTO[]) => {
	const minCalculatedPrice = variants.reduce((acc, variant) => {
		//@ts-ignore
		if (!variant.calculated_price) {
			return acc;
		}

		//@ts-ignore
		const calculated_amount = variant.calculated_price?.calculated_amount;
		if (acc === 0 && calculated_amount > 0) {
			return calculated_amount as number;
		}

		if (calculated_amount < acc) {
			return calculated_amount as number;
		}

		return acc;
	}, 0);

	return minCalculatedPrice;
};

const getMaxCalculatedPrice = (variants: ProductVariantDTO[]) => {
	const maxCalculatedPrice = variants.reduce((acc, variant) => {
		//@ts-ignore
		if (!variant.calculated_price) {
			return acc;
		}

		//@ts-ignore
		const calculated_amount = variant.calculated_price?.calculated_amount;
		if (calculated_amount > acc) {
			return calculated_amount as number;
		}

		return acc;
	}, 0);

	return maxCalculatedPrice;
};

export default updateProductSearchMetadataStep;
