import { Module } from '@medusajs/framework/utils'
import AdminModuleService from './service'

export const ADMIN_MODULE = "adminModuleService"

export default Module(ADMIN_MODULE, {
  service: AdminModuleService,
})
