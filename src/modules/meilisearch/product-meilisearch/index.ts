import { Module } from "@medusajs/framework/utils";
import ProductMeiliSearchModuleService from "./service";

export const PRODUCT_MEILISEARCH_MODULE = "productMeiliSearchModuleService";

export default Module(PRODUCT_MEILISEARCH_MODULE, {
  service: ProductMeiliSearchModuleService,
});

