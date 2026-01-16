import OrderCustom from './models/order-custom'
import { Order } from '@medusajs/order/dist/models'
import { MedusaService } from '@medusajs/framework/utils'
import type { Logger } from '@medusajs/framework/types'


export default class OrderCustomModuleService extends MedusaService({
  OrderCustom,
  Order
}) {
  private logger: Logger

  async foo() {
    this.logger.info('foo')
    return 'foo'
  }

}