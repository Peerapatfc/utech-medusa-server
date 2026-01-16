import { Module } from "@medusajs/framework/utils"
import HomepageBannerService from "./service"

export const HOMEPAGE_BANNER_MODULE = "homepageBannerService"

export default Module(HOMEPAGE_BANNER_MODULE, {
  service: HomepageBannerService,
})