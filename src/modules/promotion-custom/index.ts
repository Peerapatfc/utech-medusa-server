import { Module } from '@medusajs/framework/utils';
import PromotionCustomService from './service';

export const PROMOTION_CUSTOM_MODULE = 'promotionCustomModuleService';

export default Module(PROMOTION_CUSTOM_MODULE, {
	service: PromotionCustomService,
});
