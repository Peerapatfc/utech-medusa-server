import PromotionDetail from './models/promotion-detail';
import { MedusaService } from '@medusajs/framework/utils';
import type { Logger } from '@medusajs/framework/types';

export default class PromotionCustomModuleService extends MedusaService({
	PromotionDetail,
}) {
	private readonly logger: Logger;
}
