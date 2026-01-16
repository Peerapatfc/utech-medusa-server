type BulkUpdatePrice = {
	currency_code: string;
	amount: number;
	rules?: { region_id: string };
};

type BulkUpdateInventory = {
	location_id: string;
	inventory_item_id: string;
	stocked_quantity: number;
};

type BulkUpdateVariantsType = {
	product_id: string;
	variant_id: string;
	prices: BulkUpdatePrice[];
	quantity: BulkUpdateInventory[];
};

export type BulkUpdateProductsVariantsType = {
	updates: BulkUpdateVariantsType[];
};
