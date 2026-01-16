import type {
	// DateComparisonOperator,
	NumericalComparisonOperator,
	PromotionDTO,
	// StringComparisonOperator,
} from '@medusajs/types';

export enum CouponStatus {
	KEEP = 'keep', // คูปองที่เก็บไว้
	USE = 'use', // คูปองที่สามารถใช้งานได้
	CANT_USE = 'cant_use', // คูปองที่ไม่สามารถใช้งานได้
	OUT = 'out', // คูปองหมด
	EXPIRED = 'expired', // คูปองหมดอายุ
}

export enum PromotionType {
	DISCOUNT = 'discount',
	SHIPPING = 'shipping',
}

export interface PromotionCustomRule {
	subtotal?: NumericalComparisonOperator | null;
}

export interface PromotionDetail {
	id: string;
	name: string;
	description: string;
	is_store_visible: boolean;
	custom_rules?: PromotionCustomRule;
	metadata: Record<string, unknown>;
	is_new_customer: boolean;
	promotion_type: PromotionType;
	promotion?: PromotionDTO;
	created_at: string;
	updated_at: string;
	deleted_at: string;
}

export interface CustomPromotion extends PromotionDTO {
	promotion_detail?: PromotionDetail;
	is_member_only?: boolean;
	usage_exceeded?: boolean;
	is_collected?: boolean;
	discount_value?: number;
	is_used?: boolean;
	coupon_status?: CouponStatus;
}
