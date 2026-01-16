import type { AdminOrder } from '@medusajs/framework/types';

export interface PickupOption {
	id?: string;
	name_th: string;
	name_en: string;
	slug: string;
	upfront_price: number;
	is_upfront_payment: boolean;
	is_enabled_shipping: boolean;
	is_overide_unit_price: boolean;
	shipping_start_date: string | null;
	pickup_start_date: string | null;
	rank: number;
}

export interface PreOrderTemplate {
	id?: string;
	name_th: string;
	name_en: string;
	shipping_start_date: string | null;
	pickup_start_date: string | null;
	upfront_price: number;
	created_by: string;
	metadata: {
		strapi_id: number;
		strapi_home_delivery_id: number;
		strapi_in_store_pickup_id: number;
	};
	created_at: string;
}

export interface PreOrderDetail extends AdminOrder {
	metadata: {
		is_pre_order: boolean;
		pre_order: {
			code: string;
			code_image_id: string;
			code_image_url: string;
			code_image_size: number;
			id_card_no?: string;
		};
		pickup_option: PickupOption;
	};
}

export enum PreOrderItemType {
	PREMIUM = 'premium',
	BUNDLE = 'bundle',
}

export enum ProductType {
	PRE_ORDER = 'Pre-order',
}
