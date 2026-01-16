import type { OrderLineItemDTO } from '@medusajs/framework/types';

export interface PreOrderMetadata {
	is_delivery: boolean;
	is_pickup: boolean;
	code: string;
	code_image_url: string;
	id_card_no: string;
	delivery_terms: string;
	delivery_sub_terms: string;
	in_store_pickup_terms: string;
	in_store_pickup_sub_terms: string;
	delivery_terms_en: string;
	delivery_sub_terms_en: string;
	in_store_pickup_terms_en: string;
	in_store_pickup_sub_terms_en: string;
	down_payment: string;
	down_payment_total: number;
	amount_to_be_paid: string;
	footer_url: string;
	map_url: string;
}

export interface EnhancedOrderLineItem extends OrderLineItemDTO {
	subtotal: string;
}
