import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { BRAND_BANNER_MODULE } from "../../../modules/strapi/brand-banner"
import type BrandBannerService from "../../../modules/strapi/brand-banner/service"
import type { Logger } from "@medusajs/framework/types"


export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
    const logger: Logger = req.scope.resolve('logger')
    try {

        const brandBannerService: BrandBannerService = req.scope.resolve(
            BRAND_BANNER_MODULE,
        )

        const result = await brandBannerService.getListAll()
        res.json({
            data: result,
        })
    } catch (error) {
        logger.error('Error in GET brand banner:', error)
        res.status(500).json({
            error: 'Internal Server Error',
        })
    }
}
