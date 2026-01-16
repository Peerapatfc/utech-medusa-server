import type {
	IProductModuleService,
	ProductDTO,
} from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import type ProductStrapiService from "../../../../modules/strapi/product/service";
import { PRODUCT_STRAPI_MODULE } from "../../../../modules/strapi/product";
import type { ProductStrapi } from "../../../../modules/strapi/product/type";

const syncProductUpdatedToStrapiStep = createStep(
	"sync-product-updated-to-strapi-step",
	async (input: { product: ProductDTO }, { container }) => {
		const { product } = input;
		const productService: IProductModuleService = container.resolve(
			Modules.PRODUCT,
		);
		const productStrapiService: ProductStrapiService = container.resolve(
			PRODUCT_STRAPI_MODULE,
		);
		const logger = container.resolve("logger");

		const strapiProduct = await productStrapiService.retrieveProductByMedusaId(
			product.id,
		);
		const productData = {
			medusa_id: product.id,
			title: product.title,
			handle: product.handle,
		};

		let updatedProduct: ProductStrapi;
		const strapiIdInProduct = product?.metadata?.strapi_id as number;

		if (!strapiIdInProduct && strapiProduct) {
			logger.info(
				`Updating product metadata id: ${product.id}, strapi_id: ${strapiProduct.id}, if !strapiIdInProduct && strapiProduct`,
			);
			await productService.updateProducts(product.id, {
				metadata: {
					...product.metadata,
					strapi_id: strapiProduct.id,
				},
			});
		}

		if (strapiProduct) {
			const hasChanged =
				strapiProduct.title !== productData.title ||
				strapiProduct.handle !== productData.handle;

			if (hasChanged) {
				updatedProduct = await productStrapiService.updateProduct(
					strapiProduct.id,
					productData,
				);
			}
		} else {
			updatedProduct = await productStrapiService.createProduct(productData);
		}

		if (
			updatedProduct?.id &&
			updatedProduct.id !== product.metadata?.strapi_id
		) {
			logger.info(
				`Updating product metadata id: ${product.id}, strapi_id: ${updatedProduct.id}, if updatedProduct?.id && updatedProduct.id !== product.metadata?.strapi_id`,
			);
			const updatedMetadata = {
				...product.metadata,
				strapi_id: updatedProduct.id,
			};

			await productService.updateProducts(product.id, {
				metadata: updatedMetadata,
			});
		}

		return new StepResponse(updatedProduct, {
			strapiProduct: updatedProduct,
		});
	},
);

export default syncProductUpdatedToStrapiStep;
