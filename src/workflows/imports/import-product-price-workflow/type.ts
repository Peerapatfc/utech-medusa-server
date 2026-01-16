export interface ProductPrice {
	sku: string;
	price: string;
	special_price: string;
	special_price_from_date: string;
	special_price_to_date: string;
}

export interface ImportProductPriceWorkflowInput {
	product_prices: ProductPrice[];
	original_filename: string;
}

export interface ValidateProductPrice extends ProductPrice {
	variant_id: string | null;
	errors: string[];
	is_valid: boolean;
	product_id?: string;
}
