import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { HOME_CATEGORY_MODULE } from '../../../modules/strapi/home-category'
import type HomeCategoryService from '../../../modules/strapi/home-category/service'
import type { Logger } from '@medusajs/framework/types'


export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const logger: Logger = req.scope.resolve('logger')
  try {
    const homeCategoryService: HomeCategoryService = req.scope.resolve(
      HOME_CATEGORY_MODULE,
    )

    const locale = (req.query.locale || 'th') as string

    const result = await homeCategoryService.getListAll({ locale })
    res.json({
      data: result,
    })
  } catch (error) {
    logger.error(`Error in GET home category: ${error.message}`, error)
    res.status(500).json({
      error: error?.message || 'Internal Server Error',
    })
  }
}
