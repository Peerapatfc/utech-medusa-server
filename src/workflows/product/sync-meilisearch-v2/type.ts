import {
	BigNumberValue,
	ProductDTO,
	SalesChannelDTO,
} from '@medusajs/framework/types';

export interface ProductQuery extends ProductDTO {
	sales_channels: SalesChannelDTO[];
	variant_sku: string[];
	variant_title: string[];
	wishlist_count: number;
	inventory_quantity: number;
	in_stock: boolean;
	calculated_price: {
		min_calculated_amount: BigNumberValue;
		min_original_amount: BigNumberValue;
		max_calculated_amount: BigNumberValue;
		max_original_amount: BigNumberValue;
	};
	sku: string;
	brand: string;
	attributes: Record<string, string | number | boolean>;
	short_description: string;
}
