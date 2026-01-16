import { Module } from "@medusajs/framework/utils"
import ProductStrapiService from "./service"

export const PRODUCT_STRAPI_MODULE = "productStrapiModuleService"

export default Module(PRODUCT_STRAPI_MODULE, {
    service: ProductStrapiService,
})