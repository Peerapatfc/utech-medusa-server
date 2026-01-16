import { Module } from "@medusajs/framework/utils"
import BrandBannerService from "./service"

export const BRAND_BANNER_MODULE = "brandBannerService"

export default Module(BRAND_BANNER_MODULE, {
    service: BrandBannerService,
})