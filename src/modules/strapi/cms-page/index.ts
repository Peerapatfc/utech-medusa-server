import { Module } from "@medusajs/framework/utils"
import CmsPageService from "./service"

export const CMS_PAGE_MODULE = "cmsPageService"

export default Module(CMS_PAGE_MODULE, {
  service: CmsPageService,
})