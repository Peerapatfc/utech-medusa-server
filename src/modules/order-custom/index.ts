import { Module } from '@medusajs/framework/utils'
import OrderCustomService from './service'

export const ORDER_CUSTOM_MODULE = 'orderCustomModuleService'

export default Module(ORDER_CUSTOM_MODULE,{
  service: OrderCustomService,
})