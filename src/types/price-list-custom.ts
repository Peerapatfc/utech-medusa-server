import type {
	PriceListDTO,
	ProductVariantDTO,
	AdminPriceList as MedusaAdminPriceList,
} from '@medusajs/framework/types';

export interface PriceListCustomDTO extends PriceListDTO {
	price_list_custom: PriceListCustom;
}

export interface CustomerProductFlashSale extends PriceListCustomDTO {
	product: {
		id: string;
		title: string;
		handle: string;
		subtitle: string | null;
		description: string | null;
		thumbnail: string | null;
	};
	customers: {
		id: string;
		email: string;
		first_name: string | null;
		last_name: string | null;
		phone: string | null;
	}[];
}

export interface PriceListCustom {
	id: string;
	rank: number;
	is_flash_sale: boolean;
	created_at: string | Date;
	updated_at: string | Date;
	deleted_at?: string | Date;
	products: {
		id: string;
		rank: number;
	}[];
	is_notification_sent: boolean;
	price_list: PriceListDTO;
	price_list_variants: PriceListVariant[];
}

export interface PriceListVariant {
	id: string;
	product_variant_id: string;
	quantity: number;
	reserved_quantity: number;
	price_list_custom_id: string;
	price_list_custom?: PriceListCustom;
	product_variant: ProductVariantDTO;
	created_at: string;
	updated_at: string;
	deleted_at?: string;
}

export interface AdminPriceList extends MedusaAdminPriceList {
	price_list_custom: {
		id: string;
		products: ProductPriceListCustom[];
	};
}

export interface ProductPriceListCustom {
	id: string;
	rank: number;
}
