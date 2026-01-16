import { Module } from "@medusajs/framework/utils"
import ProductCategoryStrapiService from "./service"

export const PRODUCT_CATEGORY_STRAPI_MODULE = "productCategoryStrapiModuleService"

export default Module(PRODUCT_CATEGORY_STRAPI_MODULE, {
  service: ProductCategoryStrapiService,
})