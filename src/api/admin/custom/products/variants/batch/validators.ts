import { z } from 'zod';

export const RulePriceSchema = z.object({
	region_id: z.string(),
});
export const PriceSchema = z.object({
	amount: z.number(),
	currency_code: z.string(),
	rules: RulePriceSchema.optional(),
});

export const QuantitySchema = z.object({
	id: z.string().optional(),
	inventory_item_id: z.string(),
	location_id: z.string(),
	stocked_quantity: z.number(),
});

export const ProductVariantSchema = z.object({
	variant_id: z.string(),
	prices: z.array(PriceSchema).optional(),
	quantity: z.array(QuantitySchema).optional(),
});

export const AdminBatchUpdateProductVariantsSchema = z.object({
	updates: z.array(ProductVariantSchema),
});
