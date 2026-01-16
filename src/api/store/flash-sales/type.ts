import type { PriceListCustom } from '@customTypes/price-list-custom';
import type { PriceListDTO, ProductDTO } from '@medusajs/framework/types';

export interface FlashSale extends PriceListDTO {
	products: ProductDTO[];
	price_list_custom: PriceListCustom;
	flash_sale_min_price?: number;
	flash_sale_max_price?: number;
	count: number;
	offset: number;
	limit: number;
}
