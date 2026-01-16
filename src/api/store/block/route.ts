import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BLOCK_MODULE } from '../../../modules/strapi/block'
import type BlockService from '../../../modules/strapi/block/service'
import type { Logger } from "@medusajs/framework/types"


export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const logger: Logger = req.scope.resolve('logger')

  try {
    const blockService: BlockService = req.scope.resolve(
      BLOCK_MODULE,
    )

    const result = await blockService.getBlockBySlug(req.query.slug as string, req.query.locale as string)
    res.json({
      data: result,
    })
  } catch (error) {
    logger.error('Error in GET block:', error)
    res.status(500).json({
      error: 'Internal Server Error',
    })
  }
}
