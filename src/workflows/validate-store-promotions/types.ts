import type {
	CampaignDTO,
	HttpTypes,
	PromotionDTO,
} from '@medusajs/framework/types';
import type {
	CouponStatus,
	PromotionCustomRule,
	PromotionType,
} from '../../types/promotion';

export interface PromotionWorkflowInput {
	promo_code?: string;
	cart_id: string;
}

export interface PromotionWorkflowContext {
	cart_subtotal: number;
	promotions: Promotion[];
	cart: HttpTypes.StoreCart;
	cart_id: string;
}

export interface PromotionWorkflowResult {
	promotions: Promotion[];
}

export interface Promotion extends PromotionDTO {
	campaign?: CampaignDTO;
	promotion_detail?: {
		is_store_visible: boolean;
		is_new_customer?: boolean;
		custom_rules?: PromotionCustomRule;
		promotion_type: PromotionType;
	};
	coupon_status?: CouponStatus;
	usage_exceeded?: boolean;
	discount_value?: number;
	is_collected?: boolean;
}
