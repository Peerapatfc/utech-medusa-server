import { Module } from "@medusajs/framework/utils";
import ProductVariantImagesService from "./service";

export const PRODUCT_VARIANT_IMAGES_MODULE = "productVariantImagesModuleService";

export default Module(PRODUCT_VARIANT_IMAGES_MODULE, {
	service: ProductVariantImagesService,
});
