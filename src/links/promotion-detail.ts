import PromotionCustomModule from '../modules/promotion-custom';
import PromotionModule from '@medusajs/medusa/promotion';
import { defineLink } from '@medusajs/framework/utils';

export default defineLink(PromotionModule.linkable.promotion, {
	linkable: PromotionCustomModule.linkable.promotionDetail,
	deleteCascade: true,
});
