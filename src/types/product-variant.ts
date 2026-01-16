import type { InventoryTypes, PricingTypes } from '@medusajs/framework/types';
export interface UpdateVariant {
	product_id: string;
	variant_id: string;
	prices: PricingTypes.CreateMoneyAmountDTO[];
	quantity: InventoryTypes.UpdateInventoryLevelInput[];
}

export interface BulkUpdateVariants {
	updates: UpdateVariant[];
}
