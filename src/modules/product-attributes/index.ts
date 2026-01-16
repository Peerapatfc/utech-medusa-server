import { Module } from "@medusajs/framework/utils";
import ProductAttributeService from "./service"

export const PRODUCT_ATTRIBUTE_MODULE = "productAttributeModuleService"

export default Module(PRODUCT_ATTRIBUTE_MODULE, {
  service: ProductAttributeService,
});

