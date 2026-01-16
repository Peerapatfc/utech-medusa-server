import { InferTypeOf, ProductDTO } from '@medusajs/framework/types';
import ProductAttributeModel from '../modules/product-attributes/models/product-attribute';
import ProductAttributeOptionModel from '../modules/product-attributes/models/product-attribute-option';

export type ProductMetadataT = {
	collection_rank?: number;
};

export type ProductT = {
	id: string;
	title: string;
	thumbnail: string | null;
	metadata?: ProductMetadataT;
};

export enum InteractionType {
	VIEW = 'view',
	WISHLIST = 'wishlist',
	UNWISHLIST = 'unwishlist',
	PAYMENT_CAPTURED = 'payment_captured',
}

export type ProductSuggestScoreInput = {
	product_ids: string[];
	event_type: InteractionType;
};

export interface ProductWithFlashSale extends ProductDTO {
	is_flash_sale?: boolean;
	flash_sale?: Record<string, unknown>;
	flash_sale_min_price?: number;
}

export type ProductAttribute = InferTypeOf<typeof ProductAttributeModel> & {
	option?: InferTypeOf<typeof ProductAttributeOptionModel>;
};
export interface ProductWithAttribute extends ProductDTO {
	product_attributes?: ProductAttribute[];
}
